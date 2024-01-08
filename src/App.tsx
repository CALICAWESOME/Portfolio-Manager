import { useState } from "react";
import styles from "./App.module.css";
import { Card } from "./card/Card";
import { AddCard } from "./card/addCard/AddCard";

export type Step = {
  name: string;
  probabilityOfSuccess: number;
  timeDistribution: {
    lowerBound: number;
    upperBound: number;
    skew: number;
  };
};

const defaultState: { steps: { [id: string]: Step }; stepsOrder: string[] } = {
  steps: {
    default1: {
      name: "Assay Development",
      probabilityOfSuccess: 0.75,
      timeDistribution: {
        lowerBound: 6,
        upperBound: 12,
        skew: 0,
      },
    },
    default2: {
      name: "Screening",
      probabilityOfSuccess: 0.95,
      timeDistribution: {
        lowerBound: 3,
        upperBound: 6,
        skew: 0,
      },
    },
  },
  stepsOrder: ["default1", "default2"],
};

const newStep: Step = {
  name: "New Step",
  probabilityOfSuccess: 0.95,
  timeDistribution: {
    lowerBound: 3,
    upperBound: 6,
    skew: 0,
  },
};

function App() {
  const [state, setState] = useState(defaultState);

  return (
    <div className={styles.container}>
      {state.stepsOrder.map((stepId, index) => (
        <Card
          key={index + state.steps[stepId].name + ""}
          onDelete={() =>
            setState((state) => ({
              ...state,
              stepsOrder: state.stepsOrder.filter(
                (_, otherIndex) => index !== otherIndex
              ),
            }))
          }
          step={state.steps[stepId]}
        />
      ))}
      <AddCard
        onClick={() =>
          setState((state) => ({
            steps: { ...state.steps, newStep },
            stepsOrder: [...state.stepsOrder, "newStep"],
          }))
        }
      />
    </div>
  );
}

export default App;
