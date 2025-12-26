import React from "react";
import ReactDOM from "react-dom/client"; // Used in React 18+
import App from "./App"; // Main App component
import "./index.css"; // Global CSS styles

// Create a root and render the App component
ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
