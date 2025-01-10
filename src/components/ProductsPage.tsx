import React, { useEffect, useState } from "react";
import "../App.css";
import "../css/ProductsPage.css";
import "bootstrap/dist/css/bootstrap.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Product } from "../interfaces/Product";
import { Cart } from "../interfaces/Cart";
import Customer from "../interfaces/Customer";
import { jwtDecode } from "jwt-decode";

interface ProductsPageProps {
  type: string;
  value: number;
}

const ProductsPage: React.FC<ProductsPageProps> = ({ type, value }) => {
  const navigate = useNavigate();
  const [data, setData] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const productApiBaseURL = "http://localhost:8080/ecs-product/api/product";
  const cartApiBaseURL = "http://localhost:8080/ecs-order/api/cart";
  const [api, setApi] = useState<string>("");
  const authToken = localStorage.getItem("authToken");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isPopupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    if (type === "popular") {
      setApi("/" + type);
    } else if (type === "category") {
      setApi("/getProductsByCategoryId/" + value);
    } else if (type === "similar-products") {
      setApi("/getSimilarProductsById/" + value);
    } else {
      setError(`Invalid props: type = ${type}, value = ${value}`);
    }
  }, [type, value]);

  useEffect(() => {
    if (api && !error) {
      setLoading(true);
      axios
        .get(productApiBaseURL + api, {
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

  useEffect(() => {
    if (authToken) {
      const decodedToken = jwtDecode(authToken);
      console.log(decodedToken);
      const email = decodedToken.sub;
      const currentTime = Date.now() / 1000;
      if ((decodedToken.exp ? decodedToken.exp : 0) >= currentTime) {
        axios
          .get(
            `http://localhost:8080/ecs-customer/api/customer/getByEmail/${email}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            }
          )
          .then((response) => {
            setCustomer(response.data);
          })
          .catch((error) => {
            console.log("Error response: ", error);
          });
      } else {
        console.log("Session Expired!");
        navigate("/");
      }
    } else {
      console.log("AuthToken not found!");
      navigate("/");
    }
  }, []);

  const showPopup = () => {
    setPopupVisible(true);
    setTimeout(() => {
      setPopupVisible(false);
    }, 2000);
  };

  const navigateToProductDetails = (productId: number) => {
    navigate("/product/" + productId);
    console.log("Product Id: ", productId);
  };

  const addToCart = (productId: number) => {
    console.log("Adding product to cart : ", productId);
    const cartItems = [
      { customerId: customer?.customerId, productId: productId, quantity: 1 },
    ];
    const cartObject = {
      customerId: customer?.customerId,
      cartItems: cartItems,
    };
    if (authToken != null && productId !== -1) {
      axios
        .post(cartApiBaseURL, cartObject, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          console.log("Added to cart Successfully : ", response.data);
          showPopup();
        })
        .catch((error) => {
          console.log("Error Response : ", error.response.data);
        });
    } else {
      console.log("Please login first");
    }
  };

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
                  <div
                    className="product-link-div"
                    onClick={() =>
                      navigateToProductDetails(product.productId || -1)
                    }
                  >
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
                  </div>
                  <div className="product-non-link-div">
                    <strong>${product.productPrice.toFixed(2)}</strong>
                    <button
                      className="btn btn-red"
                      onClick={() =>
                        addToCart(product.productId ? product.productId : -1)
                      }
                      disabled={product.productQuantity <= 0 ? true : false}
                    >
                      {product.productQuantity <= 0
                        ? "Out of Stock"
                        : "Add to Cart"}
                    </button>
                  </div>
                </div>
              )))}
        </div>
      )}
      {isPopupVisible && (
        <div className="popup-overlay">
          <div className="popup-box">
            <p>
              Item added to cart <span className="color-green">&#x2713;</span>
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductsPage;
