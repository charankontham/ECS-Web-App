import React, { useState } from "react";
import HomePage from "./components/HomePage";
import ProductsPage from "./components/ProductsPage";
import CartPage from "./components/CartPage";
import SignInPage from "./components/SignInPage";
import SignUpPage from "./components/SignUpPage";
import "bootstrap/dist/css/bootstrap.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./App.css";
import AccountSettings from "./components/AccountSettings";
import MyOrders from "./components/MyOrders";
import AddressesModule from "./components/AddressesModule";
import ViewProductDetails from "./components/ViewProductDetails";
import CheckoutPage from "./components/CheckoutPage";
import OrderPlaced from "./components/OrderPlaced";

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signIn" element={<SignInPage />} />
          <Route path="/signUp" element={<SignUpPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/account" element={<AccountSettings />} />
          <Route
            path="/account/my-addresses"
            element={<AccountSettings activeSection="My Addresses" />}
          />
          <Route
            path="/account/my-orders"
            element={<AccountSettings activeSection="My Orders" />}
          />
          <Route path="/account/login-security" element={<AccountSettings />} />
          <Route
            path="/account/my-reviews"
            element={<AccountSettings activeSection="My Reviews" />}
          />
          <Route
            path="/account/close-account"
            element={<AccountSettings activeSection="Close your ECS-Account" />}
          />
          <Route
            path="/account/logout"
            element={<AccountSettings activeSection="Logout" />}
          />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/product/:productId" element={<ViewProductDetails />} />
          <Route path="/order-placed-success" element={<OrderPlaced />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
