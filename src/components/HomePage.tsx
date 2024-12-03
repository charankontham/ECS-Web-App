import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "../App.css";
import "../css/HomePage.css";
import Header from "./Header";
import Footer from "./Footer";
import ProductCategoryBar from "./ProductCategoriesBar";
import ProductsPage from "./ProductsPage";
import HeroBanner from "./HeroBanner";
import AllCategories from "./AllCategories";

const Homepage: React.FC = () => {
  const authToken = localStorage.getItem("authToken");
  const [categoryId, setProductCategoryId] = useState<number>(-1);

  const handleCategoryIdEvent = (categoryId: number) => {
    setProductCategoryId(categoryId);
  };

  return (
    <div className="homepage">
      <Header></Header>

      <ProductCategoryBar
        setProductCategoryId={handleCategoryIdEvent}
      ></ProductCategoryBar>

      {categoryId == -1 && <HeroBanner></HeroBanner>}

      {categoryId == 0 && (
        <AllCategories
          setProductCategoryId={handleCategoryIdEvent}
        ></AllCategories>
      )}

      {categoryId > 0 && (
        <ProductsPage type={"category"} value={categoryId}></ProductsPage>
      )}

      <Footer></Footer>
    </div>
  );
};

export default Homepage;
