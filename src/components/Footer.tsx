import React, { useEffect, useState } from "react";
import "../App.css";
import "../css/Footer.css";
import "bootstrap/dist/css/bootstrap.css";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <p>&copy; 2024 E-Shop. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
