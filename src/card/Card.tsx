import { ReactComponent as DeleteButtonSVG } from "./cancel.svg";
import { ReactComponent as GrabberSVG } from "./grabber.svg";

import styles from "./Card.module.css";
import { useDraggable } from "@dnd-kit/core";
import { Step } from "../mobx";
import { observer } from "mobx-react-lite";
import { Graph } from "./graph/Graph";

export const Card = observer(
  (props: { stepId: string; step: Step; onDelete: () => void }) => {
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
          onBlur={(event) => props.step.setName(event.target.value)}
          placeholder="Step"
          type="text"
        />

        <div className={styles["time-to-completion"]}>
          Probability of Success
          <Graph
            normalDistribution={props.step.probabilityOfSuccess}
            xMin={0}
            xMax={1}
            // yMax={40}
          />
          Mean: {props.step.probabilityOfSuccess.mean}
          <input
            defaultValue={props.step.probabilityOfSuccess.mean}
            min={0}
            max={1}
            onChange={(event) =>
              props.step.probabilityOfSuccess.setMean(
                parseFloat(event.target.value)
              )
            }
            step={0.01}
            type="range"
          />
          Skew: {props.step.probabilityOfSuccess.skew}
          <input
            defaultValue={props.step.probabilityOfSuccess.skew}
            min={-5}
            max={5}
            onChange={(event) =>
              props.step.probabilityOfSuccess.setSkew(
                parseFloat(event.target.value)
              )
            }
            step={0.01}
            type="range"
          />
          <div className={styles["mean-stdev-picker"]}>
            <input
              className={styles.input}
              defaultValue={props.step.probabilityOfSuccess.standardDeviation}
              min={0}
              onChange={(event) =>
                props.step.probabilityOfSuccess.setStandardDeviation(
                  parseFloat(event.target.value)
                )
              }
              step={0.01}
              type="number"
            />
            Standard Deviation
          </div>
        </div>

        <hr />
        <div className={styles["time-to-completion"]}>
          Time to completion
          <Graph normalDistribution={props.step.time} />
          Skew: {props.step.time.skew}
          <input
            defaultValue={props.step.time.skew}
            min={-5}
            max={5}
            onChange={(event) =>
              props.step.time.setSkew(parseFloat(event.target.value))
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
                props.step.time.setMean(parseInt(event.target.value))
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
                props.step.time.setStandardDeviation(
                  parseInt(event.target.value)
                )
              }
              type="number"
            />
            Standard Deviation
          </div>
        </div>
      </div>
    );
  }
);
