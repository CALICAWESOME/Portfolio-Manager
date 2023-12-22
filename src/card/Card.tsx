import { ReactComponent as DeleteButtonSVG } from "./cancel.svg";
import graph from "./graph.png";
import styles from "./Card.module.css";
import { Step } from "../App";

export function Card(props: { onDelete: () => void; step: Step }) {
  return (
    <div className={styles.card}>
      <DeleteButtonSVG
        className={styles["x-button"]}
        onClick={props.onDelete}
      />

      <input
        className={styles["step-name"]}
        defaultValue={props.step.name}
        placeholder="Step"
        type="text"
      />

      <div className={styles["probability-of-success"]}>
        <input
          className={styles["probability-input"]}
          defaultValue={props.step.probabilityOfSuccess}
          max={1}
          min={0}
          step={0.01}
          type="number"
        />{" "}
        probability of success
      </div>

      <div className={styles["time-to-completion"]}>
        <div className={styles["min-max-container"]}>
          <TimeBound default={props.step.timeDistribution.lowerBound} />
          to
          <TimeBound default={props.step.timeDistribution.upperBound} />
        </div>
        <img alt="A pretty graph" src={graph} />
        Skew
        <input type="range" />
      </div>
    </div>
  );
}

function TimeBound(props: { default: number }) {
  return (
    <div className={styles.bound}>
      <input
        className={styles.number}
        defaultValue={props.default}
        min={0}
        type="number"
      />
      <select defaultValue={"days"}>
        <option>hours</option>
        <option>days</option>
        <option>weeks</option>
        <option>months</option>
      </select>
    </div>
  );
}
