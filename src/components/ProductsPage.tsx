import React, { useEffect, useState } from "react";
import "../App.css";
import "../css/ProductsPage.css";
import "bootstrap/dist/css/bootstrap.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Product } from "../interfaces/Product";

interface ProductsPageProps {
  type: string;
  value: number;
}

const ProductsPage: React.FC<ProductsPageProps> = ({ type, value }) => {
  const [data, setData] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const apiBaseURL = "http://localhost:8080/ecs-product/api/product";
  const [api, setApi] = useState<string>("");
  console.log(type, value);

  const trimString = (input: string): string => {
    if (input.length > 40) {
      return input.substring(0, 40) + "..";
    }
    return input;
  };

  useEffect(() => {
    if (type === "popular") {
      setApi("/" + type);
    } else if (type === "category") {
      setApi("/getProductsByCategoryId/" + value);
    } else {
      setError(`Invalid props: type = ${type}, value = ${value}`);
    }
  }, [type, value]);

  useEffect(() => {
    if (api && !error) {
      setLoading(true);
      axios
        .get(apiBaseURL + api, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          setData(response.data);
          console.log(response.data);
          setLoading(false);
        })
        .catch((error) => {
          setError(error);
          setLoading(false);
        });
    }
  }, [api, error]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <section className="products">
      {!loading && (
        <div className="product-grid">
          {data != null &&
            ((data.length == 0 && <p> No products Available</p>) ||
              data.map((product) => (
                <div className="product-card" key={product.productId}>
                  <div className="product-image-box">
                    <img
                      src={
                        product.productImage
                          ? "/src/assets/images/product-images/" +
                            product.productImage
                          : ""
                      }
                      alt={product.productName}
                    />
                  </div>
                  <h6 className="product-title">{product.productName}</h6>
                  <strong>${product.productPrice.toFixed(2)}</strong>
                  <button className="btn btn-red">Add to Cart</button>
                </div>
              )))}
        </div>
      )}
    </section>
  );
};

export default ProductsPage;
