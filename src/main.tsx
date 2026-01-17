import React from "react";
import ReactDOM from "react-dom/client";

import "./styles/index.css";
import { App } from "./App";

const Game = () => {
  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Game />);
