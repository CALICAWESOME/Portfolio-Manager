import { ReactComponent as DeleteButtonSVG } from "./cancel.svg";
import { Graph } from "./graph/Graph";

import styles from "./Card.module.css";
import { Step, selectGraphData } from "../stepsSlice";

export function Card(props: {
  graphData: ReturnType<typeof selectGraphData>;
  onDelete: () => void;
  onNameChange: (value: string) => void;
  onProbabilityChange: (value: number) => void;
  onSkewChange: (value: number) => void;
  onTimeMinChange: (value: number) => void;
  onTimeMaxChange: (value: number) => void;
  step: Step;
}) {
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
          binWidth={props.graphData.binWidth}
          data={props.graphData.coordinates}
          histogramData={props.graphData.histogramCoordinates}
          xMax={props.graphData.xMax}
          xMin={props.graphData.xMin}
          yMax={props.graphData.yMax}
        />
        <div className={styles["min-max-container"]}>
          <div className={styles.bound}>
            <input
              className={styles.number}
              defaultValue={props.step.time.mean}
              min={0}
              onChange={(event) =>
                props.onTimeMinChange(parseInt(event.target.value))
              }
              type="number"
            />
          </div>
          <select defaultValue={"days"}>
            <option>days</option>
            <option>weeks</option>
            <option>months</option>
          </select>
          <div className={styles.bound}>
            <input
              className={styles.number}
              defaultValue={props.step.time.standardDeviation}
              min={0}
              onChange={(event) =>
                props.onTimeMaxChange(parseInt(event.target.value))
              }
              type="number"
            />
          </div>
        </div>
        <input
          defaultValue={props.step.time.skew}
          min={-5}
          max={5}
          onChange={(event) =>
            props.onSkewChange(parseFloat(event.target.value))
          }
          step={0.01}
          type="range"
        />
      </div>
    </div>
  );
}
