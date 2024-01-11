import { ReactComponent as DeleteButtonSVG } from "./cancel.svg";
import { Step } from "../types";
import { Graph } from "./graph/Graph";
import { useState } from "react";

import styles from "./Card.module.css";

export function Card(props: {
  onDelete: () => void;
  onNameChange: (value: string) => void;
  onProbabilityChange: (value: number) => void;
  onSkewChange: (value: number) => void;
  onTimeMinChange: (value: number) => void;
  onTimeMaxChange: (value: number) => void;
  step: Step;
}) {
  const [skew, setSkew] = useState(0);

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
          skew={skew}
          // data={[
          //   [-1, 0.5],
          //   [0, 0.75],
          //   [1, 2.5],
          // ]}
          // xMax={2.75}
          // xMin={-2.75}
          // yMax={1}
          // yMin={0}
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
          onChange={(event) => setSkew(parseFloat(event.target.value))}
          step={0.1}
          type="range"
        />
      </div>
    </div>
  );
}
