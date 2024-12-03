import React, { useEffect, useState } from "react";
import "../../css/ProductsPage.css";
import "bootstrap/dist/css/bootstrap.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProductsPage from "./ProductsPage";

const PopularProducts: React.FC = () => {
  return <ProductsPage type={"popular"} value={0}></ProductsPage>;
};

export default PopularProducts;
