import { ReactComponent as PlusCircle } from "./plus-circle-6.svg";
import styles from "./AddCard.module.css";

export function AddCard(props: { onClick: () => void }) {
  return (
    <div className={styles["add-card"]} onClick={props.onClick}>
      <PlusCircle className={styles.svg} />
    </div>
  );
}
