import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/CheckoutPage.css";
import Header from "./Header";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Customer from "../interfaces/Customer";
import { useNavigate } from "react-router-dom";
import Address from "../interfaces/Address";
import { CartItem } from "../interfaces/Cart";

const CheckoutPage = () => {
  // const rawOrderItems = localStorage.getItem("itemsForCheckout");
  const authToken = localStorage.getItem("authToken");
  const [customer, setCustomer] = useState<Customer>();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [error, setError] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  const [orderSummary, setOrderSummary] = useState<any>(null);
  const [addressFormData, setAddressFormData] = useState<Address>({
    addressId: null,
    customerId: !!customer ? customer.customerId : null,
    name: null,
    contact: null,
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const apiBaseUrl = "http://localhost:8080";
  const navigate = useNavigate();

  const fetchCustomerAndAddresses = async () => {
    try {
      if (authToken) {
        const decodedToken = jwtDecode(authToken);
        console.log(decodedToken);
        const email = decodedToken.sub;
        const currentTime = Date.now() / 1000;
        if ((decodedToken.exp ? decodedToken.exp : 0) >= currentTime) {
          try {
            const customerResponse = await axios.get(
              `http://localhost:8080/ecs-customer/api/customer/getByEmail/${email}`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            setCustomer(customerResponse.data);
            const addressResponse = await axios.get(
              `http://localhost:8080/ecs-customer/api/address/getAllAddressByCustomerId/${customerResponse.data.customerId}`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            console.log("Server res: ", addressResponse.data);
            setAddresses(addressResponse.data);
          } catch (error) {
            console.error("Error: ", error);
          }
        } else {
          console.log("Session Expired!");
          navigate("/signIn");
        }
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAddressFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validation = (): boolean => {
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validation() && authToken) {
      if (addressFormData != null) {
        axios
          .post(apiBaseUrl + "/ecs-customer/api/address", addressFormData, {
            headers: { Authorization: `Bearer ${authToken}` },
          })
          .then((response) => {
            if (response.status == 201) {
              setAddresses((prevAddresses) => [
                ...prevAddresses,
                response.data,
              ]);
              console.log("Success adding new address");
            } else {
              setError(response.data);
              console.log("Error adding new address");
            }
          })
          .catch((error) => {
            setError(error.response.data);
            console.log("Error adding new address");
          });
      } else {
        console.log("Error adding new address");
      }
    } else {
      setError("Validation Failed");
      console.log("Error adding new address");
    }
  };

  useEffect(() => {
    fetchCustomerAndAddresses();
    const subTotalString = localStorage.getItem("subTotal");
    const subTotal: number = subTotalString ? Number(subTotalString) : 0;
    setOrderSummary({
      subTotal: subTotal.toFixed(2),
      shippingFee: (6.99).toFixed(2),
      tax: (subTotal * 0.07).toFixed(2),
      total: (subTotal + 6.99 + subTotal * 0.07).toFixed(2),
    });
  }, []);

  useEffect(() => {
    setAddressFormData({
      addressId: null,
      customerId: !!customer ? customer.customerId : null,
      name: null,
      contact: null,
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    });
  }, [showPopup]);
  return (
    <>
      <Header></Header>
      <div className="container py-5">
        <h1 className="text-center mb-4">Checkout</h1>
        <div className="row">
          {/* Left Section - Address and Payment Selection */}
          <div className="col-md-8">
            {/* Address Section */}
            <div className="card mb-4">
              <div className="card-header">
                <h5>Select Shipping Address</h5>
              </div>
              <div className="card-body">
                {addresses.map((address: Address) => (
                  <div className="form-check mb-3" key={address.addressId}>
                    <input
                      className="form-check-input"
                      type="radio"
                      name="address"
                      id={address.addressId + ""}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={address.addressId + ""}
                    >
                      {address.street}, {address.city}, {address.state},{" "}
                      {address.zip}
                    </label>
                  </div>
                ))}
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowPopup(true)}
                >
                  Add New Address
                </button>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="card mb-4">
              <div className="card-header">
                <h5>Select Payment Method</h5>
              </div>
              <div className="card-body">
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="creditCard"
                    defaultChecked
                  />
                  <label className="form-check-label" htmlFor="creditCard">
                    Credit/Debit Card
                  </label>
                </div>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="paypal"
                  />
                  <label className="form-check-label" htmlFor="paypal">
                    PayPal
                  </label>
                </div>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="cod"
                  />
                  <label className="form-check-label" htmlFor="cod">
                    Cash on Delivery
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Order Summary */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h5>Order Summary</h5>
              </div>
              <div className="card-body">
                <table className="table">
                  <tbody>
                    <tr>
                      <td>Subtotal</td>
                      <td className="text-end">
                        $ {orderSummary ? orderSummary.subTotal : 0}
                      </td>
                    </tr>
                    <tr>
                      <td>Shipping</td>
                      <td className="text-end">
                        $ {orderSummary ? orderSummary.shippingFee : 0}
                      </td>
                    </tr>
                    <tr>
                      <td>Tax</td>
                      <td className="text-end">
                        $ {orderSummary ? orderSummary.tax : 0}
                      </td>
                    </tr>
                    <tr className="fw-bold">
                      <td>Total</td>
                      <td className="text-end">
                        $ {orderSummary ? orderSummary.total : 0}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <button className="btn btn-success w-100">Place Order</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="overlay">
          <div className="popup">
            <div className="popup-header">
              <h5>Add New Address</h5>
              <button className="close-btn" onClick={() => setShowPopup(false)}>
                &times;
              </button>
            </div>
            <div className="popup-body">
              <div className="add-address-container">
                <form className="add-address-form" onSubmit={handleSubmit}>
                  <div className="form-group floating-input">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className={`form-control ${
                        addressFormData.name ? "filled" : ""
                      }`}
                      value={addressFormData.name ? addressFormData.name : ""}
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
                      className={`form-control ${
                        addressFormData.contact ? "filled" : ""
                      }`}
                      value={
                        addressFormData.contact ? addressFormData.contact : ""
                      }
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
                      className={`form-control ${
                        addressFormData.street ? "filled" : ""
                      }`}
                      value={addressFormData.street}
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
                      className={`form-control ${
                        addressFormData.city ? "filled" : ""
                      }`}
                      value={addressFormData.city ? addressFormData.city : ""}
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
                      className={`form-control ${
                        addressFormData.zip ? "filled" : ""
                      }`}
                      value={addressFormData.zip}
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
                      className={`form-control ${
                        addressFormData.state ? "filled" : ""
                      }`}
                      value={addressFormData.state}
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
                      value={addressFormData.country}
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

                  {error && <div className="error-msg">{error}</div>}

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      Save Address
                    </button>
                    <button
                      type="button"
                      className="btn btn-warning"
                      onClick={() => setShowPopup(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutPage;
