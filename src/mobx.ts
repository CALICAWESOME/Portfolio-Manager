import { makeAutoObservable } from "mobx";
import { SKEWED_PDF } from "./stats_stuff";
import _ from "lodash";

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

  setName = (name: string) => (this.name = name);
  setProbabilitiyOfSuccess = (value: number) =>
    (this.probabilityOfSuccess = value);

  constructor() {
    makeAutoObservable(this);
  }
}

export class NormalDistribution {
  mean = 0;
  skew = 0;
  standardDeviation = 1;

  samples = {
    max: Number.NEGATIVE_INFINITY,
    min: Number.POSITIVE_INFINITY,
    samples: [],
  };

  get graphData() {
    const coordinates: [number, number][] = [];

    let x = 0;
    let transformed_x = Number.POSITIVE_INFINITY;
    let y = Number.POSITIVE_INFINITY;
    let yMax = 0;
    const x_increment = 0.01;
    const y_threshold = 0.01;

    const condition = () => y >= y_threshold && transformed_x >= 0;

    // Fill in the right side of the normal graph
    for (; condition(); x += x_increment) {
      // Calculate y first
      y = SKEWED_PDF(x, this.skew);

      // Then transform x
      transformed_x = x * this.standardDeviation + this.mean;

      coordinates.push([transformed_x, y]);

      if (y > yMax) {
        yMax = y;
      }
    }

    // Reset to the middle of the graph
    x = -x_increment;
    y = Number.POSITIVE_INFINITY;

    // Fill in the left side of the normal graph
    for (; condition(); x -= x_increment) {
      y = SKEWED_PDF(x, this.skew);

      transformed_x = x * this.standardDeviation + this.mean;

      coordinates.unshift([transformed_x, y]);

      if (y > yMax) {
        yMax = y;
      }
    }

    return { coordinates, yMax };
  }

  setMean = (value: number) => (this.mean = value);
  setSkew = (value: number) => (this.skew = value);
  setStandardDeviation = (value: number) => (this.standardDeviation = value);

  constructor() {
    makeAutoObservable(this);
  }
}
