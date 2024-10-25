import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { nanoid } from "nanoid";
import { RANDOM_SKEW_NORMAL, SKEWED_PDF } from "./stats_stuff";

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
    default3: {
      name: "New Step!",
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
    default4: {
      name: "Another new step",
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
  stepsOrder: ["default1", "default2", "default3", "default4"],
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
    addStep: (state, action: PayloadAction<string>) => {
      const newId = nanoid(10);

      state.steps[newId] = defaultNewStep;

      const index = state.stepsOrder.indexOf(action.payload);
      state.stepsOrder.splice(index + 1, 0, newId);
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
    moveStep: (
      state,
      action: PayloadAction<{ moveTo: string; dragging: string }>
    ) => {
      const newOrder = state.stepsOrder.reduce(
        (finishedArray, currentElement) => {
          // If this element is not the one we're dragging
          if (currentElement !== action.payload.dragging) {
            // Add it to the result array
            finishedArray.push(currentElement);
            // (in order to exclude the one we're dragging form its
            //  original position in the list)
          }

          // If this is the step we're moving the dragged element to
          if (currentElement === action.payload.moveTo) {
            // Append the dragged element after the current element
            finishedArray.push(action.payload.dragging);
          }

          return finishedArray;
        },
        [] as string[]
      );

      state.stepsOrder = newOrder;
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
  moveStep,
} = stepsReducer.actions;
export const { selectGraphData } = stepsReducer.selectors;
export default stepsReducer.reducer;
