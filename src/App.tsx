import { connect } from "react-redux";
import { Card } from "./card/Card";
import { AddCard } from "./card/addCard/AddCard";
import { RootState } from "./store";
import {
  addStep,
  deleteStep,
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
import { DndContext, useDroppable } from "@dnd-kit/core";

function Gap(props: { stepId: string }) {
  const { isOver, setNodeRef } = useDroppable({ id: props.stepId });

  const style = {
    backgroundColor: isOver ? "green" : "blue",
    width: isOver ? 24 : 1,
    height: "100",
    transitionDuration: "100ms",
    transitionProperty: "width",
  };

  return <div ref={setNodeRef} style={style}></div>;
}

export default connect(
  (state: RootState) => ({ state }),
  (dispatch) => ({ dispatch })
)((props: { state: RootState; dispatch: Dispatch<UnknownAction> }) => (
  <DndContext>
    <div id="everything">
      <div className={styles.container}>
        {props.state.steps.stepsOrder.map((stepId, index) => (
          <>
            <Card
              graphData={selectGraphData(props.state, stepId)}
              key={index + props.state.steps.steps[stepId].name + ""}
              onDelete={() => props.dispatch(deleteStep(stepId))}
              onNameChange={(name) =>
                props.dispatch(setStepName({ id: stepId, value: name }))
              }
              onProbabilityChange={(probability) =>
                props.dispatch(
                  setStepProbability({ id: stepId, value: probability })
                )
              }
              onSkewChange={(value) =>
                props.dispatch(setStepTimeSkew({ id: stepId, value }))
              }
              onTimeMaxChange={(value) =>
                props.dispatch(
                  setStepTimeStandardDeviation({ id: stepId, value })
                )
              }
              onTimeMinChange={(value) =>
                props.dispatch(setStepTimeMean({ id: stepId, value }))
              }
              stepId={stepId}
              step={props.state.steps.steps[stepId]}
            />
            <Gap stepId={stepId} />
          </>
        ))}
        <AddCard onClick={() => props.dispatch(addStep())} />
      </div>
      <Output
        steps={props.state.steps.steps}
        stepsOrder={props.state.steps.stepsOrder}
      />
    </div>
  </DndContext>
));
