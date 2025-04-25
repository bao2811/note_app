import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthPage from "./AuthPage";
import HomePage from "./HomePage";
import "./styles/index.css";
import "./styles/auth.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" />} />
        <Route path="/auth" element={<AuthPage isLogin={true} />} />
        <Route path="/auth/login" element={<AuthPage isLogin={true} />} />
        <Route path="/auth/register" element={<AuthPage isLogin={false} />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
