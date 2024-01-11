export type Step = {
  name: string;
  probabilityOfSuccess: number;
  time: {
    min: number;
    max: number;
    skew: number;
  };
};

export type Steps = { [id: string]: Step };
