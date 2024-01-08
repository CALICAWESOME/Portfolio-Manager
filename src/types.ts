export type Step = {
  name: string;
  probabilityOfSuccess: number;
  timeDistribution: {
    lowerBound: number;
    upperBound: number;
    skew: number;
  };
};
