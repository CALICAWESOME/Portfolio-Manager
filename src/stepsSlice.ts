import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Step, Steps } from "./types";

const defaultStep: Step = {
  name: "New Step",
  probabilityOfSuccess: 0.95,
  timeDistribution: {
    lowerBound: 3,
    upperBound: 6,
    skew: 0,
  },
};

const defaultSteps: { steps: Steps; stepsOrder: string[] } = {
  steps: {
    default1: {
      name: "Assay Development",
      probabilityOfSuccess: 0.75,
      timeDistribution: {
        lowerBound: 6,
        upperBound: 12,
        skew: 0,
      },
    },
    default2: {
      name: "Screening",
      probabilityOfSuccess: 0.95,
      timeDistribution: {
        lowerBound: 3,
        upperBound: 6,
        skew: 0,
      },
    },
  },
  stepsOrder: ["default1", "default2"],
};

const stepsReducer = createSlice({
  initialState: defaultSteps,
  name: "steps",
  reducers: {
    addStep: (state) => {
      state.steps["newStep"] = defaultStep;
      state.stepsOrder = [...state.stepsOrder, "newStep"];
    },

    deleteStep: (state, action: PayloadAction<string>) => {
      const idToDelete = action.payload;

      delete state.steps[idToDelete];
      state.stepsOrder = state.stepsOrder.filter((id) => id !== idToDelete);
    },
  },
});

export const { addStep, deleteStep } = stepsReducer.actions;
export default stepsReducer.reducer;
