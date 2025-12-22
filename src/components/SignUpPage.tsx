import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "@src/App.css";
import "../css/SignUpPage.css";
import axios from "axios";
import Customer from "../interfaces/Customer";
import { faEye, faEyeSlash, faL } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { API_BASE_URL } from "../util/api";

const SignUpPage: React.FC = () => {
  const [formData, setFormData] = useState({
    customerId: null,
    customerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const customerApiUrl = `${API_BASE_URL}/ecs-customer/api/customer`;

  const passwordValidation = (value: string): boolean => {
    if (!value || value.trim() === "" || value === "null") {
      return false;
    }
    const regex =
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&\-+=()])(?=\S+$).{8,20}$/;
    console.log(value);
    return regex.test(value);
  };

  const validateSignUpForm = (): string => {
    if (
      formData.customerName === null ||
      formData.customerName === "" ||
      formData.customerName.length > 20
    ) {
      return "name";
    } else if (formData.phone.length !== 10) {
      return "phone";
    } else if (!passwordValidation(formData.password)) {
      console.log(passwordValidation(formData.password));
      return "password";
    } else if (formData.confirmPassword !== formData.password) {
      return "confirm password";
    } else if (formData.email === null || formData.email === "") {
      return "email";
    }
    return "success";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    const validationResult = validateSignUpForm();
    if (validationResult == "success") {
      const customerData: Customer = formData;
      customerData.role = "user";
      axios
        .post(`${customerApiUrl}/registration`, customerData)
        .then((response) => {
          if (response.status === 400) {
            setLoading(false);
            setError(response.data);
          } else if (response.status == 409) {
            setLoading(false);
            console.log(response.data);
            setError(response.data);
          } else if (response.status === 201) {
            setLoading(false);
            localStorage.setItem("authToken", response.data);
            navigate("/");
          } else {
            setLoading(false);
            setError(response.data);
          }
        })
        .catch((error) => {
          setLoading(false);
          console.log(error.response.data);
          setError(error.response.data);
        });
    } else {
      setLoading(false);
      setError(validationResult != "success" ? validationResult : null);
    }
    setLoading(false);
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h1 className="signup-title">Create an Account</h1>
        <p className="signup-subtitle">Sign up to start shopping!</p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="customerName" className="form-label">
              Name
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              className="form-input"
              placeholder="Enter your name"
              value={formData.customerName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-input"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-with-icon">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className="password-toggle-icon"
                onClick={() => setShowPassword((prev) => !prev)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-input"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {loading && (
            <p className="loadingMessage">
              Wait for a moment, Creating account for you!
            </p>
          )}

          {error && (
            <p className="errorMessage">
              {error == "Duplicate email!"
                ? "Email already exists"
                : error == "name"
                ? "Name should lessthan 20 characters"
                : error == "password"
                ? "Password must be 8-20 characters long, include at least one uppercase letter, one lowercase letter, one digit, and one special character."
                : "Invalid " + error}
            </p>
          )}

          <div className="form-actions">
            <button type="submit" className="btn signup-btn">
              Create Account
            </button>
          </div>
        </form>

        <div className="additional-links">
          <p>
            Already have an account?{" "}
            <a href="/signIn" className="link signin-link">
              Sign In here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
