export interface Step {
  name: string;
  probabilityOfSuccess: number;
  time: {
    mean: number;
    skew: number;
    standardDeviation: number;
  };
}

export type Steps = { [id: string]: Step };
