import { ReactComponent as DeleteButtonSVG } from "./cancel.svg";
import graph from "./graph.png";
import styles from "./Card.module.css";

export function Card(props: { onClick: () => void }) {
  return (
    <div className={styles.card}>
      <DeleteButton {...props} />
      <StepName />
      <ProbabilityOfSuccess />
      <TimeToCompletion />
    </div>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return <DeleteButtonSVG className={styles["x-button"]} onClick={onClick} />;
}

function StepName() {
  return (
    <input className={styles["step-name"]} placeholder="Step" type="text" />
  );
}

function ProbabilityOfSuccess() {
  return (
    <div className={styles["probability-of-success"]}>
      <input
        className={styles["probability-input"]}
        defaultValue={25}
        max={100}
        min={0}
        type="number"
      />{" "}
      % chance to succeed
    </div>
  );
}

function TimeToCompletion() {
  return (
    <div className={styles["time-to-completion"]}>
      <div className={styles["min-max-container"]}>
        <TimeBound />
        to
        <TimeBound />
      </div>
      <img alt="A pretty graph" src={graph} />
      Skew
      <input type="range" />
    </div>
  );
}

function TimeBound() {
  return (
    <div className={styles.bound}>
      <input className={styles.number} min={0} type="number" />
      <select>
        <option>hours</option>
        <option>days</option>
        <option>weeks</option>
        <option>months</option>
      </select>
    </div>
  );
}
