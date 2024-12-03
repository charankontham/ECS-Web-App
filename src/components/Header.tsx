import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "../App.css";
import "../css/Header.css";
import {
  faGears,
  faShoppingCart,
  faSliders,
  faUser,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Customer from "../interfaces/Customer";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Cart } from "../interfaces/Cart";

const Header: React.FC = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const authToken = localStorage.getItem("authToken");
  const navigate = useNavigate();

  const fetchCustomerAndCart = async () => {
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

            const cartResponse = await axios.get(
              `http://localhost:8080/ecs-order/api/cart/getCartByCustomerId/${customerResponse.data.customerId}`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  "Content-Type": "application/json",
                },
              }
            );

            setCart(cartResponse.data);
          } catch (error) {
            console.error("Error: ", error);
          }
        } else {
          console.log("Session Expired!");
          // navigate("/login");
        }
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  useEffect(() => {
    fetchCustomerAndCart();
  }, []);

  return (
    <header className="header">
      <div className="logo">
        <a href="/">ECS-Shopper</a>
      </div>
      <input
        type="text"
        className="search-bar"
        placeholder="Search products..."
      />
      <div className="header-buttons">
        {customer ? (
          <div className="user-info" onClick={() => navigate("/account")}>
            <span className="user-name">
              Hello, {customer.customerName?.split(" ")[0]}
            </span>
            <span className="account-settings">
              Account <FontAwesomeIcon icon={faGears} />
            </span>
          </div>
        ) : (
          <>
            <button
              className="btn btn-blue"
              onClick={() => navigate("/signIn")}
            >
              Sign In
            </button>
          </>
        )}
        <div className="cart-icon-container">
          <FontAwesomeIcon icon={faShoppingCart} size="2xl"></FontAwesomeIcon>
          {cart && cart?.cartItems.length != 0 && (
            <span className="cart-badge">{cart?.cartItems.length}</span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
