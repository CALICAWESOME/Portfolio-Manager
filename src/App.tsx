import { useDispatch, useSelector } from "react-redux";
import styles from "./App.module.css";
import { Card } from "./card/Card";
import { AddCard } from "./card/addCard/AddCard";
import { RootState } from "./store";
import { addStep, deleteStep } from "./stepsSlice";
import { Output } from "./output";

function App() {
  const dispatch = useDispatch();
  const state = useSelector((state: RootState) => state.steps);

  return (
    <div className={styles.container}>
      {state.stepsOrder.map((stepId, index) => (
        <Card
          key={index + state.steps[stepId].name + ""}
          onDelete={() => dispatch(deleteStep(stepId))}
          step={state.steps[stepId]}
        />
      ))}
      <AddCard onClick={() => dispatch(addStep())} />
      <Output steps={state.steps} stepsOrder={state.stepsOrder} />
    </div>
  );
}

export default App;
