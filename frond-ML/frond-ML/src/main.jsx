  import React from "react";
  import ReactDOM from "react-dom/client";
  import { BrowserRouter, Routes, Route } from "react-router-dom";

  import App from "./App.jsx";
  import "./styles/global.css";
  import "./styles/colors.css";
  import "./styles/fonts.css";

  import Register from "./pages/Register";
  import Login from "./pages/LoginModal";

  ReactDOM.createRoot(document.getElementById("root")).render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/loginmodal" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
