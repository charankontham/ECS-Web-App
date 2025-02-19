import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.css";
import "../../css/AllCatgories.css";
import ProductCategory from "../../interfaces/ProductCategory";
import { useNavigate } from "react-router-dom";

const AllCategories: React.FC = () => {
  const [productCategories, setProductCategories] = useState<
    ProductCategory[] | null
  >(null);
  const navigate = useNavigate();

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
                    src={
                      category.categoryImage
                        ? "/src/assets/images/category-images/" +
                          category.categoryImage
                        : ""
                    } //{category.image}
                    alt={category.categoryName}
                    className="card-img-top category-image"
                  />
                  <div className="card-body">
                    <h5 className="card-title">{category.categoryName}</h5>
                    {/* <button className="btn btn-outline-primary btn-sm">
                      Explore {category.categoryName}
                    </button> */}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default AllCategories;
