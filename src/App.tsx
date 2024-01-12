import { connect } from "react-redux";
import { Card } from "./card/Card";
import { AddCard } from "./card/addCard/AddCard";
import { RootState } from "./store";
import {
  addStep,
  deleteStep,
  selectGraphData,
  setStepMaxTime,
  setStepMinTime,
  setStepName,
  setStepProbability,
  setStepSkew,
} from "./stepsSlice";
import { Output } from "./output";
import { Dispatch, UnknownAction } from "@reduxjs/toolkit";

import styles from "./App.module.css";

export default connect(
  (state: RootState) => ({ state }),
  (dispatch) => ({ dispatch })
)((props: { state: RootState; dispatch: Dispatch<UnknownAction> }) => (
  <div className={styles.container}>
    {props.state.steps.stepsOrder.map((stepId, index) => (
      <Card
        graphData={selectGraphData(props.state, stepId)}
        key={index + props.state.steps.steps[stepId].name + ""}
        onDelete={() => props.dispatch(deleteStep(stepId))}
        onNameChange={(name) =>
          props.dispatch(setStepName({ id: stepId, value: name }))
        }
        onProbabilityChange={(probability) =>
          props.dispatch(setStepProbability({ id: stepId, value: probability }))
        }
        onSkewChange={(value) =>
          props.dispatch(setStepSkew({ id: stepId, value }))
        }
        onTimeMaxChange={(value) =>
          props.dispatch(setStepMaxTime({ id: stepId, value }))
        }
        onTimeMinChange={(value) =>
          props.dispatch(setStepMinTime({ id: stepId, value }))
        }
        step={props.state.steps.steps[stepId]}
      />
    ))}
    <AddCard onClick={() => props.dispatch(addStep())} />
    <Output
      steps={props.state.steps.steps}
      stepsOrder={props.state.steps.stepsOrder}
    />
  </div>
));
