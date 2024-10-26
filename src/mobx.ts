import { makeAutoObservable } from "mobx";

export class Steps {
  steps = {
    default1: new Step(),
    default2: new Step(),
    default3: new Step(),
    default4: new Step(),
  } as { [id: string]: Step };
  stepsOrder = ["default1", "default2", "default3", "default4"];

  deleteStep(stepId: string) {
    delete this.steps[stepId];
    this.stepsOrder = this.stepsOrder.filter(
      (existingStepId) => existingStepId !== stepId
    );
  }

  moveStep(moveTo: string, dragging: string) {
    const newOrder = this.stepsOrder.reduce((finishedArray, currentElement) => {
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
    }, [] as string[]);

    this.stepsOrder = newOrder;
  }

  constructor() {
    makeAutoObservable(this);
  }
}

export class Step {
  name = "New Step";
  probabilityOfSuccess = 0.95;
  time = new NormalDistribution();

  constructor() {
    makeAutoObservable(this);
  }

  setName = (name: string) => (this.name = name);
  setProbabilitiyOfSuccess = (value: number) =>
    (this.probabilityOfSuccess = value);
}

class NormalDistribution {
  mean = 0;
  skew = 0;
  standardDeviation = 1;

  samples = {
    max: Number.NEGATIVE_INFINITY,
    min: Number.POSITIVE_INFINITY,
    samples: [],
  };

  constructor() {
    makeAutoObservable(this);
  }

  setMean = (value: number) => (this.mean = value);
  setSkew = (value: number) => (this.skew = value);
  setStandardDeviation = (value: number) => (this.standardDeviation = value);
}
