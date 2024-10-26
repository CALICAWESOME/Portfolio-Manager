import { erf } from "mathjs";

const PDF_COEFF = 1 / Math.sqrt(2 * Math.PI);
const STANDARD_PDF = (x: number) => PDF_COEFF * Math.exp(-0.5 * Math.pow(x, 2));
const STANDARD_CDF = (x: number) => 0.5 * (1 + erf(x / Math.sqrt(2)));
export const SKEWED_PDF = (
  x: number,
  standardDeviation: number,
  skew: number
) => (2 / standardDeviation) * STANDARD_PDF(x) * STANDARD_CDF(skew * x);

// Code borrowed from https://spin.atomicobject.com/skew-normal-prng-javascript/
const RANDOM_NORMALS = () => {
  let [random1, random2] = [0, 0];
  //Convert [0,1) to (0,1)
  while (random1 === 0) random1 = Math.random();
  while (random2 === 0) random2 = Math.random();

  const magnitude = Math.sqrt(-2.0 * Math.log(random1));
  const direction = 2.0 * Math.PI * random2;
  return [magnitude * Math.cos(direction), magnitude * Math.sin(direction)];
};

export const RANDOM_SKEW_NORMAL = (skew: number = 0) => {
  const [boxMuller1, boxMuller2] = RANDOM_NORMALS();
  if (skew === 0) {
    return boxMuller1;
  }

  const delta = skew / Math.sqrt(1 + Math.pow(skew, 2));
  const skewedRandomNormal =
    delta * boxMuller1 + Math.sqrt(1 - Math.pow(delta, 2)) * boxMuller2;
  return boxMuller1 >= 0 ? skewedRandomNormal : -skewedRandomNormal;
};
