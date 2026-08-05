import React from "react";
import ReactDOM from "react-dom/client";
// first: both webviews share this entry, so i18n is ready before any render
import "@/i18n";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
