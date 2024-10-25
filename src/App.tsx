import { connect } from "react-redux";
import { Card } from "./card/Card";
import { AddCard } from "./card/addCard/AddCard";
import { RootState } from "./store";
import {
  addStep,
  deleteStep,
  moveStep,
  selectGraphData,
  setStepName,
  setStepProbability,
  setStepTimeMean,
  setStepTimeSkew,
  setStepTimeStandardDeviation,
} from "./stepsSlice";
import { Output } from "./Output";
import { Dispatch, UnknownAction } from "@reduxjs/toolkit";

import styles from "./App.module.css";
import { DndContext, DragEndEvent, useDroppable } from "@dnd-kit/core";
import { useCallback } from "react";

function Gap(props: { stepId: string }) {
  const { isOver, setNodeRef } = useDroppable({ id: props.stepId });

  const style = {
    backgroundColor: isOver ? "green" : "none",
  };

  return (
    <div className={styles["gap-container"]} ref={setNodeRef}>
      <div className={styles.gap} />
    </div>
  );
}

export default connect(
  (state: RootState) => ({ state }),
  (dispatch) => ({ dispatch })
)(
  ({
    dispatch,
    ...props
  }: {
    state: RootState;
    dispatch: Dispatch<UnknownAction>;
  }) => {
    const onDragEnd = useCallback(
      (event: DragEndEvent) => {
        console.log(event);
        if (!event.over) {
          return;
        }

        dispatch(
          moveStep({
            moveTo: event.over.id.toString(),
            dragging: event.active.id.toString(),
          })
        );
      },
      [dispatch]
    );

    return (
      <DndContext onDragEnd={onDragEnd}>
        <div id="everything">
          <div className={styles.container}>
            {props.state.steps.stepsOrder.map((stepId, index) => (
              <>
                <Card
                  graphData={selectGraphData(props.state, stepId)}
                  key={index + props.state.steps.steps[stepId].name + ""}
                  onDelete={() => dispatch(deleteStep(stepId))}
                  onNameChange={(name) =>
                    dispatch(setStepName({ id: stepId, value: name }))
                  }
                  onProbabilityChange={(probability) =>
                    dispatch(
                      setStepProbability({ id: stepId, value: probability })
                    )
                  }
                  onSkewChange={(value) =>
                    dispatch(setStepTimeSkew({ id: stepId, value }))
                  }
                  onTimeMaxChange={(value) =>
                    dispatch(
                      setStepTimeStandardDeviation({ id: stepId, value })
                    )
                  }
                  onTimeMinChange={(value) =>
                    dispatch(setStepTimeMean({ id: stepId, value }))
                  }
                  stepId={stepId}
                  step={props.state.steps.steps[stepId]}
                />
                <Gap stepId={stepId} />
              </>
            ))}
            <AddCard onClick={() => dispatch(addStep())} />
          </div>
          <Output
            steps={props.state.steps.steps}
            stepsOrder={props.state.steps.stepsOrder}
          />
        </div>
      </DndContext>
    );
  }
);
