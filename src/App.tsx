import { Card } from "./card/Card";
import { Output } from "./output/Output";

import styles from "./App.module.css";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useCallback } from "react";
import { Gap } from "./card/gap/Gap";
import { Steps } from "./mobx";
import { observer } from "mobx-react-lite";
import { OutputGraph } from "./output/OutputGraph";

export const App = observer((props: { steps: Steps }) => {
  const onDragEnd = useCallback((event: DragEndEvent) => {
    console.log(event);
    if (!event.over) {
      return;
    }

    props.steps.moveStep(event.over.id.toString(), event.active.id.toString());
  }, []);

  return (
    <DndContext onDragEnd={onDragEnd}>
      <div id="everything">
        <div className={styles.container}>
          {props.steps.stepsOrder.map((stepId, index) => (
            <>
              <Card
                key={index + props.steps.steps[stepId].name + ""}
                onDelete={() => props.steps.deleteStep(stepId)}
                step={props.steps.steps[stepId]}
                stepId={stepId}
              />
              <Gap
                stepId={stepId}
                onClick={() => props.steps.addStep(stepId)}
              />
            </>
          ))}
        </div>
        <Output steps={props.steps} />
        {props.steps.timeHistogramData && (
          <OutputGraph histogramData={props.steps.timeHistogramData} />
        )}
        {props.steps.probabilityOfSuccessHistogramData && (
          <OutputGraph
            histogramData={props.steps.probabilityOfSuccessHistogramData}
          />
        )}
      </div>
    </DndContext>
  );
});
