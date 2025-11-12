import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "@src/App.css";
import Header from "./home-common/Header";
import ProductCategoryBar from "./home-common/ProductCategoriesBar";
import { useNavigate } from "react-router-dom";
import AllCategories from "./home-common/AllCategories";

const ViewAllCategories: React.FC = () => {
  const navigate = useNavigate();
  const setCategoryId = (id: number) => {
    if (id == 0) {
      navigate("/all-categories");
    } else {
      navigate("/products/category/" + id);
    }
  };
  return (
    <>
      <div className="nav-bar">
        <Header></Header>
      </div>
      <ProductCategoryBar
        setProductCategoryId={setCategoryId}
      ></ProductCategoryBar>
      <AllCategories></AllCategories>
    </>
  );
};

export default ViewAllCategories;
