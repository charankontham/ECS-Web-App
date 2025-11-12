import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "@src/App.css";
import "../css/HomePage.css";
import Header from "./home-common/Header";
import Footer from "./Footer";
import HeroBanner from "./HeroBanner";
import { useNavigate } from "react-router-dom";
import ProductCategoryBar from "./home-common/ProductCategoriesBar";

const Homepage: React.FC = () => {
  const navigate = useNavigate();
  const handleCategoryIdEvent = (categoryId: number) => {
    if (categoryId == 0) {
      navigate("/all-categories");
    } else {
      console.log("Id : ", categoryId);
      navigate("/products/category/" + categoryId);
    }
  };

  return (
    <div className="homepage">
      <Header></Header>
      <ProductCategoryBar
        setProductCategoryId={handleCategoryIdEvent}
      ></ProductCategoryBar>
      <HeroBanner></HeroBanner>
      <Footer></Footer>
    </div>
  );
};

export default Homepage;
