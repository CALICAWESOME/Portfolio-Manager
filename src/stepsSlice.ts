import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { erf } from "mathjs";
import { nanoid } from "nanoid";

const PDF_COEFF = 1 / Math.sqrt(2 * Math.PI);
const STANDARD_PDF = (x: number) => PDF_COEFF * Math.exp(-0.5 * Math.pow(x, 2));
const STANDARD_CDF = (x: number) => 0.5 * (1 + erf(x / Math.sqrt(2)));
const SKEWED_PDF = (x: number, skew: number) =>
  2 * STANDARD_PDF(x) * STANDARD_CDF(skew * x);

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

export interface Step {
  name: string;
  probabilityOfSuccess: number;
  time: {
    mean: number;
    samples: { max: number; min: number; samples: number[] };
    skew: number;
    standardDeviation: number;
  };
}

interface StepsState {
  numSamples: number;
  steps: Record<string, Step>;
  stepsOrder: string[];
}

const defaultSteps: StepsState = {
  numSamples: 1000,
  steps: {
    default1: {
      name: "Assay Development",
      probabilityOfSuccess: 0.75,
      time: {
        mean: 9,
        samples: {
          max: Number.NEGATIVE_INFINITY,
          min: Number.POSITIVE_INFINITY,
          samples: [],
        },
        skew: 0,
        standardDeviation: 1,
      },
    },
    default2: {
      name: "Screening",
      probabilityOfSuccess: 0.95,
      time: {
        mean: 4.5,
        samples: {
          max: Number.NEGATIVE_INFINITY,
          min: Number.POSITIVE_INFINITY,
          samples: [],
        },
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
    samples: {
      max: Number.NEGATIVE_INFINITY,
      min: Number.POSITIVE_INFINITY,
      samples: [],
    },
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
    generateSamples: (state) => {
      state.stepsOrder.map((stepId) => {
        let max = Number.NEGATIVE_INFINITY;
        let min = Number.POSITIVE_INFINITY;
        const samples = [];

        for (let i = 0; i < 1000; i++) {
          const sample = RANDOM_SKEW_NORMAL(state.steps[stepId].time.skew);
          samples.push(sample);

          if (sample < min) min = sample;
          if (sample > max) max = sample;
        }

        state.steps[stepId].time.samples = { max, min, samples };
      });
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
      (state, time: Step["time"]) => {
        const numBins = 30;

        // Bin samples
        const binWidth = (time.samples.max - time.samples.min) / numBins;
        const increment = 1 / (state.numSamples * binWidth);
        const bins = time.samples.samples.reduce((bins, sample) => {
          const bin = Math.floor(sample / binWidth) * binWidth;
          bins[bin] = bins[bin] + increment || increment;

          return bins;
        }, {} as { [bin: number]: number });

        console.log(bins);

        // Turn bins into coordinates
        let yMax = 0;
        const histogramCoordinates: [number, number][] = Object.entries(bins)
          .sort(([x1], [x2]) => +x1 - +x2)
          .map(([x, y]) => {
            if (y > yMax) yMax = y;
            return [+x, y];
          });

        let coordinates: [number, number][] = [];
        for (let x = -3; x < 3; x += 0.006) {
          const y = SKEWED_PDF(x, time.skew);

          if (y > yMax) yMax = y;

          coordinates.push([x, y]);
        }

        return {
          binWidth,
          coordinates,
          histogramCoordinates,
          unBinnedSamples: time.samples.samples,
          xMax: 3,
          xMin: -3,
          yMax,
        };
      }
    ),
  },
});

export const {
  addStep,
  deleteStep,
  generateSamples,
  setStepName,
  setStepProbability,
  setStepTimeMean,
  setStepTimeSkew,
  setStepTimeStandardDeviation,
} = stepsReducer.actions;
export const { selectGraphData } = stepsReducer.selectors;
export default stepsReducer.reducer;
