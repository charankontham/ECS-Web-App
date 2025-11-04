import React, { useEffect, useRef, useState } from "react";
import "../css/SignInPage.css";
import "bootstrap/dist/css/bootstrap.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Customer from "../interfaces/Customer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignIn } from "@fortawesome/free-solid-svg-icons";
import Header from "./home-common/Header";

const SignInPage: React.FC = () => {
  const navigate = useNavigate();

  const passwordValidation = (value: string): boolean => {
    if (!value || value.trim() === "" || value === "null") {
      return false;
    }
    const regex =
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&-+=()])(?=\S+$).{8, 20}$/;
    return regex.test(value);
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);

  const validateCredentials = (event: React.FormEvent) => {
    setLoading(true);
    event.preventDefault();
    if (password && email) {
      const customer: Customer = {
        customerId: null,
        email: email,
        password: password,
      };
      try {
        axios
          .post(
            "http://localhost:8080/ecs-customer/api/customer/login",
            customer,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
          .then((response) => {
            setLoading(false);
            console.log("response : ", response);
            if (response.status == 200) {
              localStorage.setItem("authToken", response.data);
              navigate("/");
            } else {
              setError(response.data);
            }
          })
          .catch((error) => {
            setLoading(false);
            console.log(error);
            setError(error);
          });
      } catch (err) {
        setLoading(false);
        setError(err);
      }
    } else {
      setLoading(false);
      setError("Enter email and password!");
    }
  };

  return (
    <>
      <Header />
      <div className="signin-container">
        <div className="signin-box">
          <h1 className="signin-title">Welcome Back</h1>
          <p className="signin-subtitle">Sign in to your account</p>

          <form className="signin-form" onSubmit={validateCredentials}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="form-input"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="form-input"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <p className="errorMessage">Wrong credentials! try again</p>
            )}

            {loading && <p>Wait a second, authentication in progress!</p>}

            <div className="form-actions">
              <button type="submit" className="btn signin-btn">
                Sign In <FontAwesomeIcon icon={faSignIn} />
              </button>
            </div>
          </form>

          <div className="additional-links">
            <a href="/forgot-password" className="link forgot-link">
              Forgot your password?
            </a>
            <p>
              New to ecs?{" "}
              <a href="/signUp" className="link signup-link">
                Sign Up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInPage;
