import React, { useEffect, useState } from "react";
import "@src/App.css";
import "../css/ProductsPage.css";
import "bootstrap/dist/css/bootstrap.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Product } from "../interfaces/Product";
import Customer from "../interfaces/Customer";
import { jwtDecode } from "jwt-decode";
import Header from "./home-common/Header";
import ProductCategoryBar from "./home-common/ProductCategoriesBar";
import Footer from "./Footer";
import { API_BASE_URL } from "../util/api";

const ProductsPage: React.FC = () => {
  const { type, value } = useParams<{ type: string; value?: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [api, setApi] = useState<string>("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const authToken = localStorage.getItem("authToken");
  const customerApiUrl = `${API_BASE_URL}/ecs-customer/api/customer`;
  const productApiUrl = `${API_BASE_URL}/ecs-product/api/product`;
  const cartApiURL = `${API_BASE_URL}/ecs-order/api/cart`;
  const imageApiUrl = `${API_BASE_URL}/ecs-inventory-admin/api/public/images`;

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
        .get(`${productApiUrl}${api}`, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          setData(response.data);
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
      const email = decodedToken.sub;
      const currentTime = Date.now() / 1000;
      if ((decodedToken.exp ? decodedToken.exp : 0) >= currentTime) {
        axios
          .get(`${customerApiUrl}/getByEmail/${email}`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          })
          .then((response) => {
            setCustomer(response.data);
          })
          .catch((error) => {
            console.error("Error response: ", error);
          });
      } else {
        console.log("Session Expired!");
      }
    } else {
      console.log("AuthToken not found!");
    }
  }, []);

  const setCategoryId = (id: number) => {
    if (id == 0) {
      navigate("/all-categories");
    } else {
      navigate("/products/category/" + id);
    }
  };

  const showPopup = () => {
    setPopupVisible(true);
    setTimeout(() => {
      setPopupVisible(false);
    }, 2000);
  };

  const addToCart = (productId: number) => {
    const cartItems = [
      { customerId: customer?.customerId, productId: productId, quantity: 1 },
    ];
    const cartObject = {
      customerId: customer?.customerId,
      cartItems: cartItems,
    };
    if (authToken != null && authToken.length > 0) {
      axios
        .post(cartApiURL, cartObject, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        })
        .then(() => {
          showPopup();
        })
        .catch((error) => {
          console.log("Error Response : ", error.response.data);
        });
    } else {
      console.log("Please login first");
      navigate("/signIn");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="products-page-container">
      <div className="nav-bar">
        <Header></Header>
      </div>
      <ProductCategoryBar
        setProductCategoryId={setCategoryId}
      ></ProductCategoryBar>
      <section className="products">
        {!loading && (
          <div className="product-grid">
            {data != null &&
              ((data.length == 0 && (
                <p className="no-products-available"> No Products! </p>
              )) ||
                data.map((product) => (
                  <div className="product-card" key={product.productId}>
                    <div className="product-link-div">
                      <a href={`/product/${product.productId}`}>
                        <div className="product-image-box">
                          <img
                            src={
                              product.productImage == "" ||
                              product.productImage == null
                                ? `/assets/images/image-placeholder.jpg`
                                : `${imageApiUrl}/view/getImageById/${product.productImage}`
                            }
                            alt={product.productName}
                          />
                        </div>
                        <h6 className="product-title">{product.productName}</h6>
                      </a>
                    </div>
                    <div className="product-non-link-div">
                      <strong>${product.productPrice.toFixed(2)}</strong>
                      <button
                        className="btn btn-red"
                        onClick={() => addToCart(product.productId!)}
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
      <Footer></Footer>
    </div>
  );
};

export default ProductsPage;
