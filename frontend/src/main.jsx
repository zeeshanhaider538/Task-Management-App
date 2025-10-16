import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "antd/dist/reset.css"; // AntD CSS reset
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
// src/main.jsx
// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
// import "antd/dist/reset.css"; // AntD CSS reset
// import "./index.css";

// ReactDOM.createRoot(document.getElementById("root")).render(<App />);
