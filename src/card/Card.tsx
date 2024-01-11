import { ReactComponent as DeleteButtonSVG } from "./cancel.svg";
import { Step } from "../types";
import { Graph } from "./graph/Graph";
import { erf } from "mathjs";
import { range } from "d3";

import styles from "./Card.module.css";
import { useMemo } from "react";

const PDF_COEFF = 1 / Math.sqrt(2 * Math.PI);
const STANDARD_PDF = (x: number) => PDF_COEFF * Math.exp(-0.5 * Math.pow(x, 2));
const STANDARD_CDF = (x: number) => 0.5 * (1 + erf(x / Math.sqrt(2)));
const SKEWED_PDF = (x: number, skew: number) =>
  2 * STANDARD_PDF(x) * STANDARD_CDF(skew * x);

export function Card(props: {
  onDelete: () => void;
  onNameChange: (value: string) => void;
  onProbabilityChange: (value: number) => void;
  onSkewChange: (value: number) => void;
  onTimeMinChange: (value: number) => void;
  onTimeMaxChange: (value: number) => void;
  step: Step;
}) {
  const graphData = useMemo(
    () =>
      range(0, 8, 0.01).reduce(
        (accumulator, x) => {
          const y = SKEWED_PDF(x - 4, props.step.time.skew);

          // Push coordinates to data
          accumulator.coordinates.push([x, y]);

          // Find max y value for y-axis clamping
          if (y > accumulator.yMax) {
            accumulator.yMax = y;
          }

          return accumulator;
        },
        {
          coordinates: [] as [number, number][],
          yMax: 0,
        }
      ),
    [props.step.time.skew]
  );

  return (
    <div className={styles.card}>
      <DeleteButtonSVG
        className={styles["x-button"]}
        onClick={props.onDelete}
      />

      <input
        className={styles["step-name"]}
        defaultValue={props.step.name}
        onChange={(event) => props.onNameChange(event.target.value)}
        placeholder="Step"
        type="text"
      />

      <div className={styles["probability-of-success"]}>
        <input
          className={styles["probability-input"]}
          defaultValue={props.step.probabilityOfSuccess}
          max={1}
          min={0}
          onChange={(event) =>
            props.onProbabilityChange(parseFloat(event.target.value))
          }
          step={0.01}
          type="number"
        />{" "}
        probability of success
      </div>

      <div className={styles["time-to-completion"]}>
        <Graph
          data={graphData.coordinates}
          xMax={7}
          xMin={1}
          yMax={graphData.yMax}
        />
        <div className={styles["min-max-container"]}>
          <div className={styles.bound}>
            <input
              className={styles.number}
              defaultValue={props.step.time.min}
              min={0}
              type="number"
            />
          </div>{" "}
          <select defaultValue={"days"}>
            <option>days</option>
            <option>weeks</option>
            <option>months</option>
          </select>
          <div className={styles.bound}>
            <input
              className={styles.number}
              defaultValue={props.step.time.max}
              min={0}
              type="number"
            />
          </div>
        </div>
        <input
          min={-10}
          max={10}
          onChange={(event) =>
            props.onSkewChange(parseFloat(event.target.value))
          }
          step={0.1}
          type="range"
        />
      </div>
    </div>
  );
}
