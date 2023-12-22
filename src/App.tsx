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

type StepMap = { [id: string]: Step };

type Process = {
  order: string[];
  steps: StepMap;
};

const defaultSteps: Step[] = [
  {
    name: "Assay Development",
    probabilityOfSuccess: 0.75,
    timeDistribution: {
      lowerBound: 6,
      upperBound: 12,
      skew: 0,
    },
  },
  {
    name: "Screening",
    probabilityOfSuccess: 0.95,
    timeDistribution: {
      lowerBound: 3,
      upperBound: 6,
      skew: 0,
    },
  },
];

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
  const [steps, setSteps] = useState(defaultSteps);

  return (
    <div className={styles.container}>
      {steps.map((step, index) => (
        <Card
          key={index + step.name + ""}
          onDelete={() =>
            setSteps((steps) =>
              steps.filter((_, otherIndex) => index !== otherIndex)
            )
          }
          step={step}
        />
      ))}
      <AddCard onClick={() => setSteps((steps) => [...steps, newStep])} />
    </div>
  );
}

export default App;
