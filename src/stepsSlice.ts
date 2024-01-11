import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Step, Steps } from "./types";

const defaultStep: Step = {
  name: "New Step",
  probabilityOfSuccess: 0.95,
  time: {
    min: 3,
    max: 6,
    skew: 0,
  },
};

/*
 * Min and max will be 3 standard deviations from the mean in either direction
 * (This means that mean and std. dev can be computed from min and max)
 */
const defaultSteps: { steps: Steps; stepsOrder: string[] } = {
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
export default stepsReducer.reducer;
