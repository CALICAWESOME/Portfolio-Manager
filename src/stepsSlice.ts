import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { Step, Steps } from "./types";
import { nanoid } from "nanoid";
import { range } from "lodash";

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
        const numBins = 30;
        const numSamples = 10000;
        const increment = numBins / numSamples;

        // Generate samples
        const sampleData = range(numSamples).reduce(
          ({ samples, xMax, xMin }) => {
            const sample = RANDOM_SKEW_NORMAL(time.skew);
            samples.push(sample);

            if (sample < xMin) xMin = sample;
            if (sample > xMax) xMax = sample;

            return { samples, xMax, xMin };
          },
          {
            samples: [] as number[],
            xMax: Number.NEGATIVE_INFINITY,
            xMin: Number.POSITIVE_INFINITY,
          }
        );

        // Bin samples
        const binWidth = (sampleData.xMax - sampleData.xMin) / numBins;
        const bins = sampleData.samples.reduce((bins, sample) => {
          const bin = Math.floor(sample / binWidth) * binWidth;
          bins[bin] = bins[bin] + increment || increment;

          return bins;
        }, {} as { [bin: number]: number });

        // Turn bins into coordinates
        let yMax = 0;
        const coordinates: [number, number][] = Object.entries(bins)
          .sort(([x1], [x2]) => +x1 - +x2)
          .map(([x, y]) => {
            if (y > yMax) yMax = y;
            return [+x, y];
          });

        return {
          binWidth,
          coordinates,
          unBinnedSamples: sampleData.samples,
          xMax: sampleData.xMax,
          xMin: sampleData.xMin,
          yMax,
        };
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
