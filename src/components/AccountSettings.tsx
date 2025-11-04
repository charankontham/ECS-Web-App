import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "@src/App.css";
import "../css/AccountSettings.css";
import Header from "./home-common/Header";
import Footer from "./Footer";
import LoginSubSettingModule from "./LoginSubSettingModule";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Customer from "../interfaces/Customer";
import Address from "../interfaces/Address";
import UpdatePasswordModule from "./UpdatePasswordModule";
import AddressesModule from "./AddressesModule";
import AddressForm from "./AddOrUpdateAddressModule";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOut, faTrash } from "@fortawesome/free-solid-svg-icons";
import MyOrders from "./MyOrders";
import ProductReviews from "./reviews-and-ratings/ProductReviews";

const AccountSettings: React.FC<{ activeSection?: string }> = (
  accountSettings = { activeSection: "Login & Security" }
) => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  // const addressId = searchParams.get("addressId");
  // const orderFilterByDate = searchParams.get("orderFilterByDate");
  // const orderFilterByStatus = searchParams.get("orderFilterByStatus");
  // const orderSearchByName = searchParams.get("orderSearchByName");
  const navigate = useNavigate();
  const apiBaseUrl = "http://localhost:8080/ecs-customer/api";
  const authToken = localStorage.getItem("authToken");
  const [activeSection, setActiveSection] = useState("Login & Security");
  const [activeSubSetting, setActiveSubSetting] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const sections = [
    { name: "Login & Security", id: "login-security" },
    { name: "My Addresses", id: "my-addresses" },
    { name: "My Orders", id: "my-orders" },
    { name: "My Reviews", id: "my-reviews" },
    { name: "Close Your ECS-Account", id: "close-account" },
    { name: "Logout", id: "logout" },
  ];

  useEffect(() => {
    fetchCustomerAndAddresses().then(() => {
      setActiveSection(
        accountSettings.activeSection
          ? accountSettings.activeSection
          : "Login & Security"
      );
    });
  }, []);

  const setBackFunction = (setBack: boolean) => {
    if (setBack) {
      setActiveSubSetting("");
    }
  };

  const updateAddresses = (updatedAddress: Address) => {
    console.log("Entered into update address");
    const index = addresses.findIndex(
      (x) => x.addressId === updatedAddress.addressId
    );
    if (index > -1) {
      addresses[index] = updatedAddress;
    } else {
      console.log("pushed to addresses");
      addresses.push(updatedAddress);
    }
  };

  const logout = () => {
    localStorage.setItem("authToken", "");
    navigate("/");
  };

  const handleConfirm = () => {
    axios
      .delete(apiBaseUrl + `/customer/${customer?.customerId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          console.log("Account permanently closed.");
          localStorage.setItem("authToken", "");
          navigate("/");
        } else {
          console.log("Error : ", response.data);
        }
      })
      .catch((error) => {
        console.log("Error : ", error);
      });
    setPopupVisible(false);
  };

  const handleCancel = () => {
    setPopupVisible(false);
  };

  const fetchCustomerAndAddresses = async () => {
    try {
      if (authToken) {
        const decodedToken = jwtDecode(authToken);
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
            if (customerResponse.status !== 200) {
              console.log(customerResponse.data);
              navigate("/signIn");
            }

            const addressResponse = await axios.get(
              `http://localhost:8080/ecs-customer/api/address/getAllAddressByUserId/customer_${customerResponse.data.customerId}`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            console.log("Address Response : ", addressResponse);
            setAddresses(addressResponse.data);
          } catch (error) {
            console.error("Error: ", error);
            navigate("/signIn");
          }
        } else {
          console.log("Session Expired!");
          navigate("/signIn");
        }
      } else {
        navigate("/signIn");
      }
    } catch (error) {
      console.error("Error: ", error);
      navigate("/signIn");
    }
  };

  const renderSubSettings = () => {
    if (activeSection === "Login & Security") {
      if (activeSubSetting === "Password") {
        return (
          <UpdatePasswordModule
            customer={customer}
            setBackToSubSetting={setBackFunction}
          ></UpdatePasswordModule>
        );
      }

      if (activeSubSetting === "Name") {
        return (
          <LoginSubSettingModule
            fieldName="Name"
            fieldValue={customer?.customerName || "Not available"}
            customer={customer}
            setBackToSubSetting={setBackFunction}
          ></LoginSubSettingModule>
        );
      }

      if (activeSubSetting === "Phone") {
        return (
          <LoginSubSettingModule
            fieldName="Phone"
            fieldValue={customer?.phone || "Not available"}
            customer={customer}
            setBackToSubSetting={setBackFunction}
          ></LoginSubSettingModule>
        );
      }

      if (activeSubSetting === "Email") {
        return (
          <LoginSubSettingModule
            fieldName="Email"
            fieldValue={customer?.email || "Not Available"}
            customer={customer}
            setBackToSubSetting={setBackFunction}
          ></LoginSubSettingModule>
        );
      }

      return (
        <div className="settings-content login-security-content">
          <h3>Login & Security</h3>
          <ul className="list-group">
            <li className="list-group-item">
              <div>
                <span>Name</span>
                <br />
                {customer?.customerName}
              </div>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setActiveSubSetting("Name")}
              >
                Edit
              </button>
            </li>
            <li className="list-group-item">
              <div>
                <span>Phone</span>
                <br />
                {customer?.phone}
              </div>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setActiveSubSetting("Phone")}
              >
                Edit
              </button>
            </li>
            <li className="list-group-item">
              <div>
                <span>Email</span>
                <br />
                {customer?.email}
              </div>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setActiveSubSetting("Email")}
              >
                Edit
              </button>
            </li>
            <li className="list-group-item">
              <div>
                <span>Password</span>
                <br /> *********
              </div>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setActiveSubSetting("Password")}
              >
                Edit
              </button>
            </li>
          </ul>
        </div>
      );
    }

    if (activeSection === "My Addresses") {
      if (activeSubSetting === "NewAddressForm") {
        return (
          <AddressForm
            address={null}
            customer={customer}
            setBackToSubSetting={setBackFunction}
            updateAddresses={updateAddresses}
          ></AddressForm>
        );
      } else if (activeSubSetting.includes("AddressId:")) {
        return (
          <AddressForm
            address={
              addresses.filter(
                (x) => x.addressId === Number(activeSubSetting.substring(10))
              )[0]
            }
            customer={customer}
            setBackToSubSetting={setBackFunction}
            updateAddresses={updateAddresses}
          ></AddressForm>
        );
      }
      return (
        <AddressesModule
          setActiveSubSetting={setActiveSubSetting}
          addressList={addresses}
        ></AddressesModule>
      );
    }

    if (activeSection === "My Orders") {
      if (orderId) {
        return <MyOrders orderId={orderId}></MyOrders>;
      } else return <MyOrders></MyOrders>;
    }

    if (activeSection === "My Reviews") {
      return <ProductReviews></ProductReviews>;
    }

    if (activeSection === "Close your ECS-Account") {
      return (
        <div className="settings-content">
          <h3>Close your ECS-Account</h3>
          <p className="text-danger">
            Warning: Closing your account will permanently delete your data.
            This action cannot be undone.
          </p>
          <button
            className="btn btn-danger delete-account-btn"
            onClick={() => setPopupVisible(true)}
          >
            <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon> Delete Account
          </button>
          {isPopupVisible && (
            <div className="popup-overlay">
              <div className="popup-box">
                <h2>Are you sure?</h2>
                <p>
                  This action is irreversible. Your account will be permanently
                  closed.
                </p>
                <div className="popup-actions">
                  <button
                    className="close-account-confirm-btn"
                    onClick={handleConfirm}
                  >
                    Yes, Close Account
                  </button>
                  <button
                    className="close-account-cancel-btn"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeSection === "Logout") {
      return (
        <div className="settings-content">
          <h3>Logout</h3>
          <p>Click the button below to log out of your account.</p>
          <button className="btn btn-warning" onClick={logout}>
            Logout <FontAwesomeIcon icon={faSignOut}></FontAwesomeIcon>
          </button>
        </div>
      );
    }
  };

  return (
    <>
      <Header></Header>
      <section className="account-settings-section">
        <div className="account-settings-page">
          <div className="row">
            {/* Left Panel */}
            <div className="col-md-4 settings-menu">
              <h4>Account Settings</h4>
              <ul className="list-group" id="account-main-settings">
                {sections.map((section) => (
                  <li
                    key={section.id}
                    className={`.btn-yellow list-group-item ${
                      activeSection === section.name ? "active" : ""
                    }`}
                    onClick={() => {
                      window.location.replace("/account/" + section.id);
                    }}
                  >
                    {section.name}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Panel */}
            <div className="col-md-8 settings-detail">
              {renderSubSettings()}
            </div>
          </div>
        </div>
      </section>
      <Footer></Footer>
    </>
  );
};

export default AccountSettings;
