import { Steps } from "./types";

export function Output(props: { steps: Steps; stepsOrder: string[] }) {
  const overallPos = props.stepsOrder.reduce(
    (result, stepId) =>
      result * (props.steps[stepId].probabilityOfSuccess || 1),
    1
  );

  return (
    <div>
      Overall probability of success: {overallPos.toFixed(2)}
      <br />
      Time distribution:
    </div>
  );
}
