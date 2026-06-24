import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import StatProvider from "./Context/StatProvider.jsx";

createRoot(document.getElementById("root")).render(
  
    <StatProvider>
      <App />
    </StatProvider>
  
);
