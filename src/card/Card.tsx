import graph from "./graph.png";
import styles from "./Card.module.css";

export function Card() {
  return (
    <div className={styles.card}>
      <input placeholder="Step" type="text" />
      <ProbabilityOfSuccess />
      <Graph />
    </div>
  );
}

function ProbabilityOfSuccess() {
  return (
    <div>
      Probability of success:{" "}
      <input
        className={styles["probability-input"]}
        defaultValue={25}
        max={100}
        min={0}
        type="number"
      />
      %
    </div>
  );
}

function Graph() {
  return (
    <div className={styles.graph}>
      <img alt="A pretty graph" className={styles.graph} src={graph} />
      Skew
      <input type="range" />
      <div className={styles["min-max-container"]}>
        <Bound />
        <Bound />
      </div>
    </div>
  );
}

function Bound() {
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
