import React from "react";
import ReactDOM from "react-dom/client"; // Import createRoot from React 18
import App from "./App"; // Main App component
import "./index.css"; // Global styles
import { UserProvider } from './context/UserContext';


// Create a root element and render the App component
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <UserProvider>
        <React.StrictMode>
            <App />
        </React.StrictMode>
    </UserProvider>
);
