import { Steps } from "../mobx";
import { observer } from "mobx-react-lite";

export const Output = observer((props: { steps: Steps }) => {
  const overallPos = props.steps.stepsOrder.reduce(
    (result, stepId) =>
      result * props.steps.steps[stepId].probabilityOfSuccess.mean,
    1
  );

  return (
    <div style={{ marginLeft: 16 }}>
      Overall probability of success: {overallPos.toFixed(2)}
      <br />
      Time to completion (days):
      <button
        onClick={() => {
          props.steps.stepsOrder.map((stepId) =>
            props.steps.steps[stepId].time.generateHistogram()
          );
          props.steps.generateHistogram();
        }}
      >
        Simulate!
      </button>
    </div>
  );
});
