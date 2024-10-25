import { ReactComponent as DeleteButtonSVG } from "./cancel.svg";
import { ReactComponent as GrabberSVG } from "./grabber.svg";

import { Graph } from "./graph/Graph";

import styles from "./Card.module.css";
import { Step, selectGraphData } from "../stepsSlice";
import { useDraggable } from "@dnd-kit/core";

export function Card(props: {
  graphData: ReturnType<typeof selectGraphData>;
  onDelete: () => void;
  onNameChange: (value: string) => void;
  onProbabilityChange: (value: number) => void;
  onSkewChange: (value: number) => void;
  onTimeMinChange: (value: number) => void;
  onTimeMaxChange: (value: number) => void;
  stepId: string;
  step: Step;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: props.stepId,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div className={styles.card} ref={setNodeRef} style={style}>
      <DeleteButtonSVG
        className={styles["x-button"]}
        onClick={props.onDelete}
      />

      <div className={styles.grabber} {...listeners} {...attributes}>
        <GrabberSVG />
      </div>

      <input
        className={styles["step-name"]}
        defaultValue={props.step.name}
        onBlur={(event) => props.onNameChange(event.target.value)}
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
        Probability of Success
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
        Skew: {props.step.time.skew}
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
        <div className={styles["mean-stdev-picker"]}>
          <input
            className={styles.input}
            defaultValue={props.step.time.mean}
            min={0}
            onChange={(event) =>
              props.onTimeMinChange(parseInt(event.target.value))
            }
            type="number"
          />
          Mean
        </div>
        <div className={styles["mean-stdev-picker"]}>
          <input
            className={styles.input}
            defaultValue={props.step.time.standardDeviation}
            min={0}
            onChange={(event) =>
              props.onTimeMaxChange(parseInt(event.target.value))
            }
            type="number"
          />
          Standard Deviation
        </div>
      </div>
    </div>
  );
}
