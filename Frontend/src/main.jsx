// index.js or Start.jsx
import React from "react";
import { createRoot } from "react-dom/client"; // Update the import
import App from "./App.jsx";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const container = document.getElementById("root");
const root = createRoot(container); // createRoot from 'react-dom/client'
root.render(
  <React.StrictMode>
    <ToastContainer position="bottom-right" />
    <App />
  </React.StrictMode>
);
