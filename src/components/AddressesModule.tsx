import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "@src/App.css";
import "../css/Addresses.css";
import Address from "../interfaces/Address";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

interface AddressProps {
  setActiveSubSetting: (value: string) => void;
  addressList: Address[];
}

const AddressesModule: React.FC<AddressProps> = ({
  setActiveSubSetting,
  addressList,
}) => {
  const apiBaseUrl = "http://localhost:8080/ecs-customer/api";
  const authToken = localStorage.getItem("authToken");
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>(addressList);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const deleteAddress = (addressId: number) => {
    if (addressId === -1) {
      console.log("AddressId not found!");
    } else if (authToken) {
      const decodedToken = jwtDecode(authToken);
      const currentTime = Date.now() / 1000;
      if ((decodedToken.exp ? decodedToken.exp : 0) >= currentTime) {
        axios
          .delete(apiBaseUrl + `/address/${addressId}`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })
          .then((response) => {
            if (response.status == 200) {
              const updatedAddresses = addresses.filter(
                (address) => address.addressId !== addressId
              );
              setAddresses(updatedAddresses);
              setSuccess("Address deleted successfully!");
              setTimeout(() => {
                setSuccess(null);
              }, 3000);
            } else {
              console.error(
                "Failed to delete address, status code:",
                response.status
              );
              setError("Cannot delete address due to contraints!");
              setTimeout(() => {
                setError(null);
              }, 3000);
            }
          })
          .catch((error) => {
            console.error("Error deleting address:", error);
            if (error.response && error.response.status === 401) {
              console.log("Unauthorized access, redirecting to sign in.");
              navigate("/signIn");
            } else {
              console.error("Failed to delete address:", error);
              setError("Cannot delete address due to contraints!");
              setTimeout(() => {
                setError(null);
              }, 3000);
            }
          });
      } else {
        console.log("Session expired!");
        navigate("/signIn");
      }
    } else {
      console.log("AuthToken not found!");
      navigate("/signIn");
    }
  };

  return (
    <div className="settings-content address-content">
      <h3>Your Addresses</h3>
      <button
        className="btn btn-primary mb-3"
        onClick={() => setActiveSubSetting("NewAddressForm")}
      >
        <FontAwesomeIcon icon={faPlus} size="xl"></FontAwesomeIcon> Add a new
        address
      </button>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <ul className="list-group" id="addresses-list">
        {addresses &&
          addresses.map((address) => (
            <li
              className="list-group-item"
              key={"addressId:" + address.addressId}
              id={"addressId:" + address.addressId}
            >
              <div className="address-info">
                <strong>{address.name}</strong>
                <p>{address.contact}</p>
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.zip}
                </p>
                <p>
                  {address.state}, {address.country}
                </p>
              </div>
              <div>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() =>
                    setActiveSubSetting("AddressId:" + address.addressId)
                  }
                >
                  <FontAwesomeIcon icon={faPenToSquare}></FontAwesomeIcon>
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() =>
                    deleteAddress(address.addressId ? address.addressId : -1)
                  }
                >
                  <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
                </button>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default AddressesModule;
