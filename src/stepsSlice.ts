import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { Step, Steps } from "./types";
import { range as d3Range } from "d3";
import { nanoid } from "nanoid";

// Code borrowed from https://spin.atomicobject.com/skew-normal-prng-javascript/
const RANDOM_NORMALS = () => {
  let [random1, random2] = [0, 0];
  //Convert [0,1) to (0,1)
  while (random1 === 0) random1 = Math.random();
  while (random2 === 0) random2 = Math.random();

  const magnitude = Math.sqrt(-2.0 * Math.log(random1));
  const direction = 2.0 * Math.PI * random2;
  return [magnitude * Math.cos(direction), magnitude * Math.sin(direction)];
};

const RANDOM_SKEW_NORMAL = (skew: number = 0) => {
  const [boxMuller1, boxMuller2] = RANDOM_NORMALS();
  if (skew === 0) {
    return boxMuller1;
  }

  const delta = skew / Math.sqrt(1 + Math.pow(skew, 2));
  const skewedRandomNormal =
    delta * boxMuller1 + Math.sqrt(1 - Math.pow(delta, 2)) * boxMuller2;
  return boxMuller1 >= 0 ? skewedRandomNormal : -skewedRandomNormal;
};

interface StepsState {
  steps: Steps;
  stepsOrder: string[];
}

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
        const numSamples = 1000;
        const increment = numBins / numSamples;

        const bins: { [bin: number]: number } = {};

        let xMax = Number.NEGATIVE_INFINITY;
        let xMin = Number.POSITIVE_INFINITY;
        let yMax = 0;

        for (let i = 0; i < numSamples; i++) {
          const sample = RANDOM_SKEW_NORMAL(time.skew);
          const bin = Math.floor(sample * 4) / 4;
          bins[bin] = bins[bin] + increment || increment;

          if (bin < xMin) {
            xMin = bin;
          }

          if (bin > xMax) {
            xMax = bin;
          }
        }

        // Remember that there won't be _that_ many bins and that time complexity
        // for this sort isn't a huge deal (O(log(n)) where n = number of bins)
        const coordinates: [number, number][] = Object.entries(bins)
          .sort(([x1], [x2]) => +x1 - +x2)
          .map(([x, y]) => {
            if (y > yMax) yMax = y;
            return [+x, y];
          });

        console.log(coordinates);

        return { coordinates, xMax, xMin, yMax };
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
