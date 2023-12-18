import { ReactComponent as PlusCircle } from "./plus-circle-6.svg";
import styles from "./AddCard.module.css";

export function AddCard({ onClick }: { onClick: () => void }) {
  return (
    <div className={styles["add-card"]} onClick={onClick}>
      <PlusCircle className={styles.svg} />
    </div>
  );
}
