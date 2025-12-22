import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.css";
import "../../css/AllCatgories.css";
import ProductCategory from "../../interfaces/ProductCategory";
import { useNavigate } from "react-router-dom";
import Footer from "@components/Footer";
import { API_BASE_URL } from "../../util/api";

const AllCategories: React.FC = () => {
  const [productCategories, setProductCategories] = useState<
    ProductCategory[] | null
  >(null);
  const navigate = useNavigate();
  const categoryApiUrl = `${API_BASE_URL}/ecs-product/api/productCategory`;
  const imageApiUrl = `${API_BASE_URL}/ecs-inventory-admin/api/public/images/view/getImageById`;

  useEffect(() => {
    try {
      axios
        .get(`${categoryApiUrl}/`, {
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
    <section className="categories">
      <div className="all-categories container my-5">
        <h2 className="text-center mb-4">Shop By Category</h2>
        <div className="row">
          {productCategories &&
            productCategories.map((category) => (
              <div className="col-md-4 col-lg-3 mb-4" key={category.categoryId}>
                <div
                  className="category-card card shadow-sm h-100 text-center"
                  onClick={() =>
                    navigate("/products/category/" + category.categoryId)
                  }
                >
                  <img
                    src={`${imageApiUrl}/${category.categoryImage}`}
                    alt={category.categoryName}
                    className="card-img-top category-image"
                  />
                  <div className="card-body">
                    <h5 className="card-title">{category.categoryName}</h5>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      <Footer></Footer>
    </section>
  );
};

export default AllCategories;
