import React, { useEffect, useState } from "react";
import "../css/ProductCategoryBar.css";
import "@src/App.css";
import "bootstrap/dist/css/bootstrap.css";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProductCategory from "../interfaces/ProductCategory";
import { Product } from "../interfaces/Product";

interface ChildProps {
  setProductCategoryId: (id: number) => void; // Function type for callback
}

const ProductCategoryBar: React.FC<ChildProps> = ({ setProductCategoryId }) => {
  const [productCategories, setProductCategories] = useState<
    ProductCategory[] | null
  >(null);

  useEffect(() => {
    try {
      axios
        .get(`http://localhost:8080/ecs-product/api/productCategory/`, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => setProductCategories(response.data))
        .catch((error) =>
          console.error("Error fetching customer data:", error)
        );
    } catch (error) {
      console.error("Error: ", error);
    }
  }, []);

  return (
    <div className="category-bar category-bg">
      <div className="category-container d-flex justify-content-between align-items-center">
        {productCategories &&
          productCategories.slice(0, 5).map((category) => (
            <button
              key={category.categoryId}
              className="btn btn-outline-light category-button"
              onClick={() =>
                setProductCategoryId(
                  category.categoryId ? category.categoryId : 0
                )
              }
            >
              {category.categoryName}
            </button>
          ))}
        <button
          className="btn btn-outline-light category-button"
          onClick={() => setProductCategoryId(0)}
        >
          View Categories
        </button>
      </div>
    </div>
  );
};

export default ProductCategoryBar;
