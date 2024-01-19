import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { Step, Steps } from "./types";
import { range as d3Range } from "d3";
import { nanoid } from "nanoid";

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
        mean: 9,
        skew: 0,
        standardDeviation: 1,
      },
    },
    default2: {
      name: "Screening",
      probabilityOfSuccess: 0.95,
      time: {
        mean: 4.5,
        skew: 0,
        standardDeviation: 0.5,
      },
    },
  },
  stepsOrder: ["default1", "default2"],
};

const defaultNewStep: Step = {
  name: "New Step",
  probabilityOfSuccess: 0.95,
  time: {
    mean: 4.5,
    skew: 0,
    standardDeviation: 0.5,
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
    setStepTimeSkew: (
      state,
      action: PayloadAction<{ id: string; value: number }>
    ) => {
      state.steps[action.payload.id].time.skew = action.payload.value;
    },
    setStepTimeMean: (
      state,
      action: PayloadAction<{ id: string; value: number }>
    ) => {
      state.steps[action.payload.id].time.mean = action.payload.value;
    },
    setStepTimeStandardDeviation: (
      state,
      action: PayloadAction<{ id: string; value: number }>
    ) => {
      state.steps[action.payload.id].time.standardDeviation =
        action.payload.value;
    },
  },
  selectors: {
    selectGraphData: createSelector(
      (state: StepsState) => state,
      (state: StepsState, stepId: string) => state.steps[stepId].time,
      (_, time: Step["time"]) => {
        const numBins = 4; // bins per stdev
        const binWidth = 1 / numBins;
        const bins = Array();

        const numSamples = 1000;
        const increment = numBins / numSamples;

        return d3Range(numSamples).reduce(
          (accumulator, x) => {
            // const y = SKEWED_PDF((x - mean) / scale, time.skew);
            // const y = SKEWED_PDF_2(x, mean, scale, time.skew);
            // const y = SKEWED_PDF_3((x - mean) / scale, scale, time.skew);
            const y = RANDOM_SKEW_NORMAL(time.skew);

            const bin = Math.floor(y / binWidth);
            bins[bin] = bins[bin] + increment || increment;

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
            xMax: Number.POSITIVE_INFINITY,
            xMin: Number.NEGATIVE_INFINITY,
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
  setStepName,
  setStepProbability,
  setStepTimeMean,
  setStepTimeSkew,
  setStepTimeStandardDeviation,
} = stepsReducer.actions;
export const { selectGraphData } = stepsReducer.selectors;
export default stepsReducer.reducer;
