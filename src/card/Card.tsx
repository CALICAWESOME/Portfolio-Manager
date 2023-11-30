import butterfly from "./butterfly.jpg";
import styles from "./Card.module.css";

export function Card() {
  return (
    <div className={styles.card}>
      <input placeholder="Step" type="text" />
      <br />
      Probability of success:{" "}
      <input max={100} min={0} type="number" defaultValue={25} />%
      <Graph />
    </div>
  );
}

function Graph() {
  return (
    <div className={styles.graph}>
      <img alt="A pretty butterfly" className={styles.graph} src={butterfly} />
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
