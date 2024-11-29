import { Steps } from "../mobx";
import { observer } from "mobx-react-lite";

export const Output = observer((props: { steps: Steps }) => {
  return (
    <div style={{ marginLeft: 16 }}>
      Time to Completion | Probability of Success
      {/* <button
        onClick={() => {
          props.steps.stepsOrder.map((stepId) => {
            const step = props.steps.steps[stepId];

            step.time.generateHistogram();
            step.probabilityOfSuccess.generateHistogram();
          });

          props.steps.generateTimeHistogram();
          props.steps.generateProbabilityOfSuccessHistogram();
        }}
      >
        Simulate!
      </button> */}
    </div>
  );
});
