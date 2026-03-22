import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import './index.css'
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="752886008201-m9unsdqesvcebfnavcr7el1aupqephr4.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);