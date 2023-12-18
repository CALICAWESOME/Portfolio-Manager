import { useState } from "react";
import styles from "./App.module.css";
import { Card } from "./card/Card";
import { AddCard } from "./card/addCard/AddCard";

function App() {
  const [numCards, setNumCards] = useState(2);

  return (
    <div className={styles.container}>
      {new Array(numCards).fill(
        <Card onClick={() => setNumCards((current) => current - 1)} />
      )}
      <AddCard onClick={() => setNumCards((value) => value + 1)} />
    </div>
  );
}

export default App;
