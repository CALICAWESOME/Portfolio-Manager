import { useDispatch } from "react-redux";
import { Step, generateSamples } from "./stepsSlice";

export function Output(props: {
  steps: Record<string, Step>;
  stepsOrder: string[];
}) {
  const dispatch = useDispatch();

  const overallPos = props.stepsOrder.reduce(
    (result, stepId) =>
      result * (props.steps[stepId].probabilityOfSuccess || 1),
    1
  );

  return (
    <div style={{ marginLeft: 16 }}>
      Overall probability of success: {overallPos.toFixed(2)}
      <br />
      Time distribution:
      <button onClick={() => dispatch(generateSamples())}>Simulate!</button>
    </div>
  );
}
