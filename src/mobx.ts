import { makeAutoObservable } from "mobx";
import { RANDOM_SKEW_NORMAL, SKEWED_PDF } from "./stats_stuff";
import { nanoid } from "nanoid";

const NUM_HISTOGRAM_SAMPLES = 10000;

export interface HistogramData {
  y_max: number;
  histogram: [number, number][];
}

export class Steps {
  steps: { [id: string]: Step } = {
    default1: new Step(
      "Assay Development",
      new NormalDistribution(0.75, 0, 0.01),
      new NormalDistribution(9, 0, 1)
    ),
    default2: new Step(
      "Screening",
      new NormalDistribution(0.95, 0, 0.01),
      new NormalDistribution(4.5, 0, 1)
    ),
    default3: new Step(
      "????",
      new NormalDistribution(0.75, 0, 0.01),
      new NormalDistribution(9, 0, 1)
    ),
    default4: new Step(
      "Profit",
      new NormalDistribution(0.95, 0, 0.01),
      new NormalDistribution(4.5, 0, 1)
    ),
  };
  stepsOrder = ["default1", "default2", "default3", "default4"];

  timeHistogramData?: HistogramData;
  probabilityOfSuccessHistogramData?: HistogramData;

  addStep(stepId: string) {
    const newId = nanoid(10);

    // Incept new step
    this.steps[newId] = new Step(
      "New Step",
      new NormalDistribution(0.95, 0, 0.01),
      new NormalDistribution(4.5, 0, 0.5)
    );

    // Add new step into list
    const index = this.stepsOrder.indexOf(stepId);
    this.stepsOrder.splice(index + 1, 0, newId);
  }

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

  generateTimeHistogram() {
    const samples: number[] = [];

    let x_min = Number.POSITIVE_INFINITY,
      x_max = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < NUM_HISTOGRAM_SAMPLES; i++) {
      // Sum the samples at index i for each step
      const sample = this.stepsOrder.reduce(
        (sum, stepId) => sum + this.steps[stepId].time.samples[i],
        0
      );

      samples.push(sample);
      if (sample < x_min) x_min = sample;
      if (sample > x_max) x_max = sample;
    }

    console.log(samples);

    // OK now, binning!!
    const bins: { [x: number]: number } = {};
    const bin_width = (x_max - x_min) / 30;
    const increment = 1 / (NUM_HISTOGRAM_SAMPLES * bin_width);

    samples.map((sample) => {
      const bin_index = Math.floor((sample - x_min) / bin_width);
      const bin_x = bin_index * bin_width + x_min;

      bins[bin_x] = bins[bin_x] + increment || increment;
    });

    let y_max = 0;
    const histogram: [number, number][] = Object.entries(bins)
      .sort(([x1], [x2]) => +x1 - +x2)
      .map(([x, y]) => {
        if (y > y_max) y_max = y;
        return [+x, y];
      });

    const histogramData = { y_max, histogram };
    console.log(histogramData);
    this.timeHistogramData = histogramData;
  }

  generateProbabilityOfSuccessHistogram() {
    const samples: number[] = [];

    let x_min = Number.POSITIVE_INFINITY,
      x_max = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < NUM_HISTOGRAM_SAMPLES; i++) {
      // Sum the samples at index i for each step
      const sample = this.stepsOrder.reduce(
        (totalProb, stepId) =>
          totalProb * this.steps[stepId].probabilityOfSuccess.samples[i],
        1
      );

      samples.push(sample);
      if (sample < x_min) x_min = sample;
      if (sample > x_max) x_max = sample;
    }

    console.log(samples);

    // OK now, binning!!
    const bins: { [x: number]: number } = {};
    const bin_width = (x_max - x_min) / 30;
    const increment = 1 / (NUM_HISTOGRAM_SAMPLES * bin_width);

    samples.map((sample) => {
      const bin_index = Math.floor((sample - x_min) / bin_width);
      const bin_x = bin_index * bin_width + x_min;

      bins[bin_x] = bins[bin_x] + increment || increment;
    });

    let y_max = 0;
    const histogram: [number, number][] = Object.entries(bins)
      .sort(([x1], [x2]) => +x1 - +x2)
      .map(([x, y]) => {
        if (y > y_max) y_max = y;
        return [+x, y];
      });

    const histogramData = { y_max, histogram };
    console.log(histogramData);
    this.probabilityOfSuccessHistogramData = histogramData;
  }

  constructor() {
    makeAutoObservable(this);
  }
}

export class Step {
  constructor(
    public name: string,
    public probabilityOfSuccess: NormalDistribution,
    public time: NormalDistribution
  ) {
    makeAutoObservable(this);
    this.name = name;
    this.probabilityOfSuccess = probabilityOfSuccess;
    this.time = time;
  }

  setName = (name: string) => (this.name = name);
}

export class NormalDistribution {
  samples: number[] = [];
  histogramData?: HistogramData;

  setMean = (value: number) => (this.mean = value);
  setSkew = (value: number) => (this.skew = value);
  setStandardDeviation = (value: number) => (this.standardDeviation = value);

  get graphData() {
    const coordinates: [number, number][] = [];

    let x = 0;
    let transformed_x = Number.POSITIVE_INFINITY;
    let y = Number.POSITIVE_INFINITY;
    let yMax = 0;
    const x_increment = 0.01;
    const y_threshold = 0.005;

    const condition = () => y >= y_threshold && transformed_x >= 0;

    // Fill in the right side of the normal graph
    for (; condition(); x += x_increment) {
      // Calculate y first
      y = SKEWED_PDF(x, this.standardDeviation, this.skew);

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
      y = SKEWED_PDF(x, this.standardDeviation, this.skew);

      transformed_x = x * this.standardDeviation + this.mean;

      coordinates.unshift([transformed_x, y]);

      if (y > yMax) {
        yMax = y;
      }
    }

    return { coordinates, yMax };
  }

  generateHistogram() {
    const curve_coordinates = this.graphData.coordinates;
    const x_min = curve_coordinates[0][0];
    const x_range = curve_coordinates[curve_coordinates.length - 1][0] - x_min;

    const bin_width = x_range / 30;

    const samples: number[] = [];
    const bins: { [x: number]: number } = {};
    const increment = 1 / (NUM_HISTOGRAM_SAMPLES * bin_width);
    let y_max = 0;

    for (let i = 0; i < NUM_HISTOGRAM_SAMPLES; i++) {
      const sample =
        RANDOM_SKEW_NORMAL(this.skew) * this.standardDeviation + this.mean;

      samples.push(sample);

      // Add sample to appropriate bin
      const bin_index = Math.floor((sample - x_min) / bin_width);
      const bin_x = bin_index * bin_width + x_min;

      bins[bin_x] = bins[bin_x] + increment || increment;
    }

    const histogram: [number, number][] = Object.entries(bins)
      .sort(([x1], [x2]) => +x1 - +x2)
      .map(([x, y]) => {
        if (y > y_max) y_max = y;
        return [+x, y];
      });

    this.samples = samples;
    this.histogramData = { histogram, y_max };
  }

  constructor(
    public mean: number,
    public skew: number,
    public standardDeviation: number
  ) {
    makeAutoObservable(this);
    this.mean = mean;
    this.skew = skew;
    this.standardDeviation = standardDeviation;
  }
}
