import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "@src/App.css";
import "../css/AddressForm.css";
import Address from "../interfaces/Address";
import axios from "axios";
import Customer from "../interfaces/Customer";

interface AddressFormProps {
  address: Address | null;
  customer: Customer | null;
  setBackToSubSetting: (setBackToSubSetting: boolean) => void;
  updateAddresses: (updatedAddress: Address) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
  address,
  customer,
  setBackToSubSetting,
  updateAddresses,
}) => {
  const apiBaseUrl = "http://localhost:8080/ecs-customer/api";
  const authToken = localStorage.getItem("authToken");
  const [error, setError] = useState<any>(null);
  const [formData, setFormData] = useState<Address>(
    address !== null
      ? address
      : {
          addressId: null,
          userId: customer !== null ? "customer_" + customer.customerId : null,
          name: "",
          contact: "",
          street: "",
          city: "",
          state: "",
          zip: "",
          country: "",
        }
  );

  useEffect(() => {
    if (address !== null) {
      const labels = document.querySelectorAll("label");
      labels.forEach((label) => {
        label.style.top = "0px";
        label.style.left = "10px";
        label.style.fontSize = "12px";
        label.style.color = "#007bff";
      });
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validation = (): boolean => {
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validation() && authToken) {
      if (address === null) {
        axios
          .post(apiBaseUrl + "/address", formData, {
            headers: { Authorization: `Bearer ${authToken}` },
          })
          .then((response) => {
            if (response.status == 201) {
              setFormData(response.data);
              updateAddresses(response.data);
              setBackToSubSetting(true);
            } else {
              setError(response.data);
            }
          })
          .catch((error) => {
            setError(error.response.data);
          });
      } else {
        axios
          .put(apiBaseUrl + "/address", formData, {
            headers: { Authorization: `Bearer ${authToken}` },
          })
          .then((response) => {
            if (response.status == 200) {
              updateAddresses(formData);
              setBackToSubSetting(true);
            } else {
              setError(response.data);
            }
          })
          .catch((error) => {
            setError(error.response.data);
          });
      }
    } else {
      setError("Validation Failed");
    }
  };

  return (
    <div className="add-address-container">
      <h3 className="form-title">Add a new address</h3>
      <form className="add-address-form" onSubmit={handleSubmit}>
        <div className="form-group floating-input">
          <input
            type="text"
            id="name"
            name="name"
            className={`form-control ${formData.name ? "filled" : ""}`}
            value={formData.name ? formData.name : ""}
            onChange={handleChange}
            required
          />
          <label htmlFor="name">Full Name</label>
        </div>

        <div className="form-group floating-input">
          <input
            type="tel"
            id="contact"
            name="contact"
            className={`form-control ${formData.contact ? "filled" : ""}`}
            value={formData.contact ? formData.contact : ""}
            onChange={handleChange}
            required
          />
          <label htmlFor="contact">Contact</label>
        </div>

        <div className="form-group floating-input">
          <input
            type="text"
            id="street"
            name="street"
            className={`form-control ${formData.street ? "filled" : ""}`}
            value={formData.street}
            onChange={handleChange}
            required
          />
          <label htmlFor="street">Street Name</label>
        </div>

        <div className="form-group floating-input">
          <input
            type="text"
            id="city"
            name="city"
            className={`form-control ${formData.city ? "filled" : ""}`}
            value={formData.city}
            onChange={handleChange}
            required
          />
          <label htmlFor="city">City</label>
        </div>

        <div className="form-group floating-input">
          <input
            type="text"
            id="zip"
            name="zip"
            className={`form-control ${formData.zip ? "filled" : ""}`}
            value={formData.zip}
            onChange={handleChange}
            required
          />
          <label htmlFor="zip">Zip Code</label>
        </div>

        <div className="form-group floating-input">
          <input
            type="text"
            id="state"
            name="state"
            className={`form-control ${formData.state ? "filled" : ""}`}
            value={formData.state}
            onChange={handleChange}
            required
          />
          <label htmlFor="state">State</label>
        </div>

        <div className="form-group floating-input">
          <select
            id="country"
            name="country"
            className="form-control"
            value={formData.country}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select Country
            </option>
            <option value="USA">USA</option>
            <option value="Canada">Canada</option>
            <option value="India">India</option>
            <option value="UK">UK</option>
            <option value="Germany">Germany</option>
            {/* Add more countries as needed */}
          </select>
          <label htmlFor="country">Country/Region</label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Save Address
          </button>
          <button
            type="button"
            className="btn btn-warning"
            onClick={() => setBackToSubSetting(true)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
