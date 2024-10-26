import ReactDOM from "react-dom/client";
import { App } from "./App";
import reportWebVitals from "./reportWebVitals";
import { Steps } from "./mobx";

const steps = new Steps();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App steps={steps} />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
