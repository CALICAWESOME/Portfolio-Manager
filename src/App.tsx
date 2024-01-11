import { useDispatch, useSelector } from "react-redux";
import styles from "./App.module.css";
import { Card } from "./card/Card";
import { AddCard } from "./card/addCard/AddCard";
import { RootState } from "./store";
import {
  addStep,
  deleteStep,
  setStepMaxTime,
  setStepMinTime,
  setStepName,
  setStepProbability,
  setStepSkew,
} from "./stepsSlice";
import { Output } from "./output";

function App() {
  const dispatch = useDispatch();
  const state = useSelector((state: RootState) => {
    console.log(state.steps);
    return state.steps;
  });

  return (
    <div className={styles.container}>
      {state.stepsOrder.map((stepId, index) => (
        <Card
          key={index + state.steps[stepId].name + ""}
          onDelete={() => dispatch(deleteStep(stepId))}
          onNameChange={(name) =>
            dispatch(setStepName({ id: stepId, value: name }))
          }
          onProbabilityChange={(probability) =>
            dispatch(setStepProbability({ id: stepId, value: probability }))
          }
          onSkewChange={(value) => dispatch(setStepSkew({ id: stepId, value }))}
          onTimeMinChange={(value) =>
            dispatch(setStepMinTime({ id: stepId, value }))
          }
          onTimeMaxChange={(value) =>
            dispatch(setStepMaxTime({ id: stepId, value }))
          }
          step={state.steps[stepId]}
        />
      ))}
      <AddCard onClick={() => dispatch(addStep())} />
      <Output steps={state.steps} stepsOrder={state.stepsOrder} />
    </div>
  );
}

export default App;
