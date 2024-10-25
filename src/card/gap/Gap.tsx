import { useDroppable } from "@dnd-kit/core";

import { ReactComponent as PlusCircle } from "./plus-circle-6.svg";

import styles from "./Gap.module.css";

export function Gap(props: { onClick: () => void; stepId: string }) {
  const { isOver, setNodeRef } = useDroppable({ id: props.stepId });

  const style = {
    backgroundColor: isOver ? "green" : "transparent",
  };

  return (
    <div
      className={styles["gap-container"]}
      onClick={props.onClick}
      ref={setNodeRef}
      style={style}
    >
      <div className={styles.gap}>
        <PlusCircle className={styles.svg} />
      </div>
    </div>
  );
}
