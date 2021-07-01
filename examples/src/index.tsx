import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";
import "./index.css";
import { router } from "./router";

router.listen();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
