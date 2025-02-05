import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "@src/App.css";
import "../css/HeroBanner.css";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const HeroBanner: React.FC = () => {
  return (
    <div className="hero-section">
      <div className="hero-text">
        <h1>Welcome to E-Shop!</h1>
        <p>Your one-stop shop for everything.</p>
        <button className="btn btn-red">Shop Now</button>
      </div>
    </div>
  );
};

export default HeroBanner;
