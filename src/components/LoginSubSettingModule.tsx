import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "@src/App.css";
import "../css/Header.css";
import Customer from "../interfaces/Customer";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "@src/util/api";

interface SubSettingProps {
  setBackToSubSetting: (setBackToSubSetting: boolean) => void;
  fieldName: string;
  fieldValue: string;
  customer: Customer | null;
}

const LoginSubSettingModule: React.FC<SubSettingProps> = ({
  setBackToSubSetting,
  fieldName,
  fieldValue,
  customer,
}) => {
  const [loading, setLoading] = useState(false);
  const [propValue, setPropValue] = useState("");
  const [error, setError] = useState<any>(null);
  const [successMessage, setSuccess] = useState<any>(null);
  const authToken = localStorage.getItem("authToken");
  const updatedCustomer: Customer | null = customer;
  const navigate = useNavigate();
  const customerApiUrl = `${API_BASE_URL}/ecs-customer/api/customer`;

  const validateCustomerData = (event: React.FormEvent) => {
    setLoading(true);
    event.preventDefault();
    if (fieldName === "Email") {
      updatedCustomer != null
        ? (updatedCustomer.email = propValue)
        : console.log(updatedCustomer);
    } else if (fieldName === "Phone") {
      if (propValue.length == 10) {
        updatedCustomer != null
          ? (updatedCustomer.phone = propValue)
          : console.log(updatedCustomer);
      } else {
        setError("Invalid phone number");
      }
    } else if (fieldName === "Name") {
      if (propValue.length <= 20) {
        updatedCustomer != null
          ? (updatedCustomer.customerName = propValue)
          : console.log("field not updated", updatedCustomer);
      } else {
        setError("Name should lessthan 20 characters");
      }
    }

    apiCallToUpdateData()
      .then((response) => {
        setLoading(false);
        if (response !== "success") {
          setError(response);
        } else {
          setPropValue("");
          if (fieldName === "Email") {
            alert("Email updated successfully, please login again to continue");
            navigate("/signIn");
          }
          setSuccess("Changes saved successfully");
        }
      })
      .catch((error) => {
        setLoading(false);
        setError(error);
      });
  };

  const apiCallToUpdateData = async (): Promise<string> => {
    return await axios
      .put(customerApiUrl, updatedCustomer, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        if (response.status == 200) {
          return "success";
        } else {
          return response.data;
        }
      })
      .catch((error) => {
        if (error.response.status == 409) {
          return "duplicate";
        } else if (error.response.status == 400) {
          return "badrequest";
        } else {
          return error.response.data;
        }
      });
  };

  return (
    <div className="settings-content">
      <button
        onClick={() => setBackToSubSetting(true)}
        className="btn btn-link mb-3"
      >
        Back
      </button>
      <h3>Change {fieldName}</h3>
      <form onSubmit={validateCustomerData}>
        <label>
          {fieldName == "Name"
            ? customer?.customerName
            : fieldName == "Email"
            ? customer?.email
            : customer?.phone}
        </label>
        <input
          type={fieldName == "Email" ? fieldName : "text"}
          className="form-control mb-3"
          onChange={(e) => setPropValue(e.target.value)}
          value={propValue}
          required
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

export default LoginSubSettingModule;
