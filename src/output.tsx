import { Steps } from "./mobx";
import { observer } from "mobx-react-lite";

export const Output = observer((props: { steps: Steps }) => {
  const overallPos = props.steps.stepsOrder.reduce(
    (result, stepId) => result * props.steps.steps[stepId].probabilityOfSuccess,
    1
  );

  return (
    <div style={{ marginLeft: 16 }}>
      Overall probability of success: {overallPos.toFixed(2)}
      <br />
      Time distribution:
      <button
        onClick={() => props.steps.steps["default1"].time.generateHistogram()}
      >
        Simulate!
      </button>
    </div>
  );
});
