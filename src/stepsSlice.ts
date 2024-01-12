import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { Step, Steps } from "./types";
import { range } from "d3";
import { erf, mean, std } from "mathjs";
import { nanoid } from "nanoid";

// Math stuff
const PDF_COEFF = 1 / Math.sqrt(2 * Math.PI);
const STANDARD_PDF = (x: number) => PDF_COEFF * Math.exp(-0.5 * Math.pow(x, 2));
const STANDARD_CDF = (x: number) => 0.5 * (1 + erf(x / Math.sqrt(2)));
const SKEWED_PDF = (x: number, skew: number) =>
  2 * STANDARD_PDF(x) * STANDARD_CDF(skew * x);

// Code borrowed from https://spin.atomicobject.com/skew-normal-prng-javascript/
const RANDOM_NORMALS = () => {
  let [u1, u2] = [0, 0];
  //Convert [0,1) to (0,1)
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();

  const magnitude = Math.sqrt(-2.0 * Math.log(u1));
  const direction = 2.0 * Math.PI * u2;
  return [magnitude * Math.cos(direction), magnitude * Math.sin(direction)];
};

const RANDOM_SKEW_NORMAL = (skew: number = 0) => {
  const [u0, v] = RANDOM_NORMALS();
  if (skew === 0) {
    return u0;
  }

  const delta = skew / Math.sqrt(1 + Math.pow(skew, 2));
  const u1 = delta * u0 + Math.sqrt(1 - Math.pow(delta, 2)) * v;
  return u0 >= 0 ? u1 : -u1;
};

const samples = range(10000).map(() => RANDOM_SKEW_NORMAL() * 2 + 3);
console.log(mean(samples), std(samples));

interface StepsState {
  steps: Steps;
  stepsOrder: string[];
}

/*
 * Min and max will be 3 standard deviations from the mean in either direction
 * (This means that mean and std. dev can be computed from min and max)
 */
const defaultSteps: StepsState = {
  steps: {
    default1: {
      name: "Assay Development",
      probabilityOfSuccess: 0.75,
      time: {
        min: 6,
        max: 12,
        skew: 0,
      },
    },
    default2: {
      name: "Screening",
      probabilityOfSuccess: 0.95,
      time: {
        min: 3,
        max: 6,
        skew: 0,
      },
    },
  },
  stepsOrder: ["default1", "default2"],
};

const defaultNewStep: Step = {
  name: "New Step",
  probabilityOfSuccess: 0.95,
  time: {
    min: 3,
    max: 6,
    skew: 0,
  },
};

const stepsReducer = createSlice({
  initialState: defaultSteps,
  name: "steps",
  reducers: {
    addStep: (state) => {
      const newId = nanoid(10);
      state.steps[newId] = defaultNewStep;
      state.stepsOrder = [...state.stepsOrder, newId];
    },
    deleteStep: (state, action: PayloadAction<string>) => {
      const idToDelete = action.payload;

      delete state.steps[idToDelete];
      state.stepsOrder = state.stepsOrder.filter((id) => id !== idToDelete);
    },
    setStepMinTime: (
      state,
      action: PayloadAction<{ id: string; value: number }>
    ) => {
      state.steps[action.payload.id].time.min = action.payload.value;
    },
    setStepMaxTime: (
      state,
      action: PayloadAction<{ id: string; value: number }>
    ) => {
      state.steps[action.payload.id].time.max = action.payload.value;
    },
    setStepName: (
      state,
      action: PayloadAction<{ id: string; value: string }>
    ) => {
      state.steps[action.payload.id].name = action.payload.value;
    },
    setStepProbability: (
      state,
      action: PayloadAction<{ id: string; value: number }>
    ) => {
      // I cannot believe how verbose this is
      state.steps[action.payload.id].probabilityOfSuccess =
        action.payload.value;
    },
    setStepSkew: (
      state,
      action: PayloadAction<{ id: string; value: number }>
    ) => {
      state.steps[action.payload.id].time.skew = action.payload.value;
    },
  },
  selectors: {
    selectGraphData: createSelector(
      (state: StepsState) => state,
      (state: StepsState, stepId: string) => state.steps[stepId].time,
      (_, time: Step["time"]) => {
        const mean = (time.max + time.min) / 2;
        // Show six standard deviations
        const scale = (time.max - time.min) / 6;
        // Approximately 1000 steps
        const step = scale / 166;

        return range(time.min, time.max, step).reduce(
          (accumulator, x) => {
            const y = SKEWED_PDF((x - mean) / scale, time.skew);

            // Push coordinates to data
            accumulator.coordinates.push([x, y]);

            // Find max y value for y-axis clamping
            if (y > accumulator.yMax) {
              accumulator.yMax = y;
            }

            return accumulator;
          },
          {
            coordinates: [] as [number, number][],
            yMax: 0,
          }
        );
      }
    ),
  },
});

export const {
  addStep,
  deleteStep,
  setStepMinTime,
  setStepMaxTime,
  setStepName,
  setStepProbability,
  setStepSkew,
} = stepsReducer.actions;
export const { selectGraphData } = stepsReducer.selectors;
export default stepsReducer.reducer;
