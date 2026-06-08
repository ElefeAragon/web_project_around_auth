import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Header from "./Header/Header";
import Main from "./Main/Main";
import Footer from "./Footer/Footer";
import Login from "./Login";
import Register from "./Register";
import ProtectedRoute from "./ProtectedRoute";
import InfoTooltip from "./InfoTooltip";

import * as auth from "../utils/auth";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");

  const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      return;
    }

    auth
      .checkToken(token)
      .then((data) => {
        setLoggedIn(true);
        setEmail(data.data.email);
      })
      .catch((err) => {
        console.error(err);
        localStorage.removeItem("jwt");
      });
  }, []);

  const handleRegister = ({ email, password }) => {
    auth
      .register({ email, password })
      .then(() => {
        setIsSuccess(true);
        setIsInfoTooltipOpen(true);

        setTimeout(() => {
          navigate("/signin");
        }, 1500);
      })
      .catch((err) => {
        console.error(err);

        setIsSuccess(false);
        setIsInfoTooltipOpen(true);
      });
  };

  const handleLogin = ({ email, password }) => {
    auth
      .authorize({ email, password })
      .then((data) => {
        if (data.token) {
          localStorage.setItem("jwt", data.token);

          setLoggedIn(true);
          setEmail(email);

          navigate("/");
        }
      })
      .catch(console.error);
  };

  const handleSignOut = () => {
    localStorage.removeItem("jwt");

    setLoggedIn(false);
    setEmail("");

    navigate("/signin");
  };

  const closeAllPopups = () => {
    setIsInfoTooltipOpen(false);
  };

  return (
    <div className="page__content">
      <Header
        loggedIn={loggedIn}
        email={email}
        onSignOut={handleSignOut}
      />

      <Routes>
        <Route
          path="/signup"
          element={<Register onRegister={handleRegister} />}
        />

        <Route
          path="/signin"
          element={<Login onLogin={handleLogin} />}
        />

        <Route
          path="/"
          element={
            <ProtectedRoute loggedIn={loggedIn}>
              <Main />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/signin" replace />}
        />
      </Routes>

      <InfoTooltip
        isOpen={isInfoTooltipOpen}
        isSuccess={isSuccess}
        onClose={closeAllPopups}
      />

      <Footer />
    </div>
  );
}

export default App;