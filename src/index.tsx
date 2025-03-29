import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import { SolanaProvider } from "./context/SolanaContext";
import { Buffer } from "buffer";

window.Buffer = Buffer; // Make Buffer globally available

// Get the root element
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Create a root and render the app
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SolanaProvider>
      <App />
    </SolanaProvider>
  </React.StrictMode>
);