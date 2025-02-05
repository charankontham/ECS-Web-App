import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "@src/App.css";
import Customer from "../interfaces/Customer";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Cart } from "../interfaces/Cart";

interface PasswordProps {
  setBackToSubSetting: (setBackToSubSetting: boolean) => void;
  customer: Customer | null;
}

const UpdatePasswordModule: React.FC<PasswordProps> = ({
  setBackToSubSetting,
  customer,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [successMessage, setSuccess] = useState<any>(null);
  const apiBaseUrl = "http://localhost:8080/ecs-customer/api/customer";
  const authToken = localStorage.getItem("authToken");
  const updatedCustomer: Customer | null = customer;
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const updatePassword = async (event: React.FormEvent) => {
    setLoading(true);
    event.preventDefault();
    if (newPassword === confirmPassword) {
      updatedCustomer !== null
        ? (updatedCustomer.password = newPassword)
        : null;
      axios
        .put(apiBaseUrl, updatedCustomer, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
        .then((response) => {
          setLoading(false);
          if (response.status == 200) {
            console.log(response.data);
            setSuccess("Password updated successfully!");
          } else {
            setSuccess(response.data);
          }
          clearFields();
        })
        .catch((error) => {
          setLoading(false);
          if (error.response.status == 400) {
            setError("bad-request from server");
          } else {
            return setError(error.response.data);
          }
          clearFields();
        });
    }
    setLoading(false);
  };

  const clearFields = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="settings-content">
      <button
        onClick={() => setBackToSubSetting(true)}
        className="btn btn-link mb-3"
      >
        Back
      </button>
      <h3>Change Password</h3>
      <form onSubmit={updatePassword}>
        <label>Old Password</label>
        <input
          type="password"
          name="oldPassword"
          onChange={(e) => setOldPassword(e.target.value)}
          required
          className="form-control mb-3"
        />
        <label>New Password</label>
        <input
          type="password"
          name="newPassword"
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="form-control mb-3"
        />
        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="form-control mb-3"
        />

        {error && <p> {error}</p>}

        {successMessage && <p>{successMessage}</p>}

        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
        {loading && <p>updating the changes...</p>}
      </form>
    </div>
  );
};

export default UpdatePasswordModule;
