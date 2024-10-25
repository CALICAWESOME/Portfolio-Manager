import { produce } from "immer";
import { nanoid } from "nanoid";
import { create } from "zustand";

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

interface State {
  numSamples: number;
  steps: Record<string, Step>;
  stepsOrder: string[];
}

export const useStore = create<State>((set) => ({
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

  addStep: (stepId: string) =>
    set(
      produce((state: State) => {
        const newId = nanoid(10);

        state.steps[newId] = {
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

        const index = state.stepsOrder.indexOf(stepId);
        state.stepsOrder.splice(index + 1, 0, newId);
      })
    ),

  deleteStep: (stepId: string) =>
    set(
      produce((state: State) => {
        delete state.steps[stepId];
        state.stepsOrder = state.stepsOrder.filter((id) => id !== stepId);
      })
    ),

  updateStep: (stepId: string, newStep: Partial<Step>) =>
    set(
      produce((state: State) => {
        const oldStep = state.steps[stepId];
        state.steps[stepId] = {
          ...oldStep,
          ...newStep,
        };
      })
    ),

  moveStep: (moveTo: string, dragging: string) =>
    set(
      produce((state: State) => {
        const newOrder = state.stepsOrder.reduce(
          (finishedArray, currentElement) => {
            // If this element is not the one we're dragging
            if (currentElement !== dragging) {
              // Add it to the result array
              finishedArray.push(currentElement);
              // (in order to exclude the one we're dragging form its
              //  original position in the list)
            }

            // If this is the step we're moving the dragged element to
            if (currentElement === moveTo) {
              // Append the dragged element after the current element
              finishedArray.push(dragging);
            }

            return finishedArray;
          },
          [] as string[]
        );

        state.stepsOrder = newOrder;
      })
    ),
}));
