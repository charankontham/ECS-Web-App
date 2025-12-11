import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "@src/App.css";
import "../css/HeroBanner.css";
import {
  faComputer,
  faFemale,
  faGem,
  faMale,
  faTshirt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Product, ProductFilters } from "@interfaces/Product";
import Customer from "@interfaces/Customer";
import { Order, OrderItemEnriched } from "@interfaces/Order";

const HeroBanner: React.FC = () => {
  const [recentlyPurchased, setRecentlyPurchased] = useState<Product[]>([]);
  const [techDeals, setTechDeals] = useState<Product[]>([]);
  const [priceDropDeals, setPriceDropDeals] = useState<Product[]>([]);
  const navigate = useNavigate();
  const authToken = localStorage.getItem("authToken");
  const apiBaseUrl = "http://localhost:8080/";
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const shopByPrices = [
    {
      id: 10,
      name: "Under $10",
      image:
        "http://localhost:8080/ecs-inventory-admin/api/public/images/view/getImageById/690837c6f092e71713581727",
    },
    {
      id: 20,
      name: "Under $20",
      image:
        "http://localhost:8080/ecs-inventory-admin/api/public/images/view/getImageById/690837eaf092e71713581728",
    },
    {
      id: 50,
      name: "Under $50",
      image:
        "http://localhost:8080/ecs-inventory-admin/api/public/images/view/getImageById/690837f6f092e71713581729",
    },
    {
      id: 100,
      name: "Under $100",
      image:
        "http://localhost:8080/ecs-inventory-admin/api/public/images/view/getImageById/6908380ff092e7171358172a",
    },
  ];

  async function fetchUserDetails(): Promise<any> {
    try {
      if (authToken) {
        const decodedToken = jwtDecode(authToken);
        const email = decodedToken.sub;
        const currentTime = Date.now() / 1000;
        if ((decodedToken.exp ? decodedToken.exp : 0) >= currentTime) {
          const customerResponse = await axios.get(
            apiBaseUrl + `ecs-customer/api/customer/getByEmail/${email}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (customerResponse.status !== 200) {
            console.log(customerResponse.data);
            setUserLoggedIn(false);
          } else {
            setUserLoggedIn(true);
            return customerResponse.data;
          }
        } else {
          console.log("Session Expired!");
          localStorage.setItem("authToken", "");
          setUserLoggedIn(false);
        }
      } else {
        setUserLoggedIn(false);
      }
    } catch (error) {
      console.error("Error: ", error);
      setUserLoggedIn(false);
    }
    return null;
  }

  async function fetchRecentlyPurchasedItems(userId: number) {
    try {
      var recentlyPurchasedItems = await axios.get(
        apiBaseUrl + `ecs-order/api/order/getAllByPagination`,
        {
          params: { customerId: userId, offset: 4, currentPage: 0 },
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (recentlyPurchasedItems.status === 200) {
        var finalList: Product[] = [];
        (recentlyPurchasedItems.data.content as Order[]).forEach((order) => {
          order.orderItems.map((item: OrderItemEnriched) => {
            finalList.push(item.product);
          });
        });
        setRecentlyPurchased(finalList);
      }
    } catch (error) {
      console.error("Error while fetching purchased items: ", error);
    }
  }

  async function fetchFeatureProducts() {
    try {
      const priceDropFilters = {
        offset: 4,
        currentPage: 0,
      };
      var priceDropProducts = await axios.get(
        apiBaseUrl + `ecs-product/api/product/getProductsByPagination`,
        {
          params: priceDropFilters,
        }
      );
      if (priceDropProducts.status === 200) {
        setPriceDropDeals(priceDropProducts.data.content);
      }
      const techDealFilters = {
        offset: 4,
        currentPage: 0,
        categoryId: 19,
      };
      var techDealsResponse = await axios.get(
        apiBaseUrl + `ecs-product/api/product/getProductsByPagination`,
        {
          params: techDealFilters,
        }
      );
      if (techDealsResponse.status == 200) {
        setTechDeals(techDealsResponse.data.content);
      }
    } catch (error) {
      console.error("Error: ", error);
      setUserLoggedIn(false);
      navigate("/");
    }
  }

  useEffect(() => {
    fetchFeatureProducts();
    try {
      fetchUserDetails()
        .then(async (userData: Customer | null) => {
          if (userData != null)
            await fetchRecentlyPurchasedItems(userData.customerId!);
        })
        .catch((error) => {
          console.error("Error: ", error);
        });
    } catch (error) {
      console.error("Error: ", error);
      setUserLoggedIn(false);
    }
  }, []);

  const featuredCategories = [
    { name: "Men", icon: faMale, color: "#007bff" },
    { name: "Women", icon: faFemale, color: "#e83e8c" },
    { name: "Kids", icon: faTshirt, color: "#17a2b8" },
    { name: "Jewellery", icon: faGem, color: "#ffc107" },
    { name: "Electronics", icon: faComputer, color: "#28a745" },
  ];

  function getImageUrl(imageId: string): string {
    return imageId != null && imageId.trim() !== ""
      ? apiBaseUrl +
          `ecs-inventory-admin/api/public/images/view/getImageById/` +
          imageId
      : "/assets/images/image-placeholder.jpg";
  }

  function handleFeatureCategoryClick(cat: any) {
    navigate("/search-results?query=" + cat.name);
  }

  return (
    <div className="hero-section">
      <div className="hero-text">
        <h1>Welcome to E-Shop!</h1>
        <p>Your one-stop shop for everything.</p>
        <button className="btn btn-red">Shop Now</button>
      </div>
      <div className="hero-features">
        <section className="featured-categories feature-section">
          <h3>Categories to explore</h3>
          <div className="featured-categories-grid">
            {featuredCategories.map((cat, index) => (
              <div
                key={index}
                className="featured-category-card"
                onClick={() => handleFeatureCategoryClick(cat)}
              >
                <div className="icon-wrapper" style={{ color: cat.color }}>
                  <FontAwesomeIcon icon={cat.icon} size="2x" />
                </div>
                <p>{cat.name}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="shop-by-prices feature-section">
          <h3>Shop items by prices</h3>
          <div className="feature-cards">
            {shopByPrices.map((product) => (
              <div
                key={product.id}
                className="features-product-card"
                onClick={() =>
                  navigate("/search-results?query=&price=" + product.id)
                }
              >
                <a href="#" onClick={(e) => e.preventDefault()}>
                  <div className="features-product-image">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="features-product-info">
                    <h5>{product.name}</h5>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="price-drop-deals feature-section">
          <h3>Price drop deals</h3>
          <div className="feature-cards">
            {priceDropDeals.map((product) => (
              <div key={product.productId} className="features-product-card">
                <a href={`/product/${product.productId}`}>
                  <div className="features-product-image">
                    <img
                      src={getImageUrl(product.productImage)}
                      alt={product.productName}
                    />
                  </div>
                  <div className="features-product-info">
                    <h5>{product.productName}</h5>
                    <p>
                      <span>${product.productPrice - 4}</span> $
                      {product.productPrice}
                    </p>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="tech-deals feature-section">
          <h3>Deals on tech</h3>
          <div className="feature-cards">
            {techDeals.map((product) => (
              <div key={product.productId} className="features-product-card">
                <a href={`/product/${product.productId}`}>
                  <div className="features-product-image">
                    <img
                      src={getImageUrl(product.productImage)}
                      alt={product.productName}
                    />
                  </div>
                  <div className="features-product-info">
                    <h5>{product.productName}</h5>
                    <p>${product.productPrice}</p>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </section>

        {userLoggedIn && (
          <section className="recently-purchased feature-section">
            <h3>Recently purchased</h3>
            <div className="feature-cards">
              {recentlyPurchased.map((product) => (
                <div key={product.productId} className="features-product-card">
                  <a href={`/product/${product.productId}`}>
                    <div className="features-product-image">
                      <img
                        src={getImageUrl(product.productImage)}
                        alt={product.productName}
                      />
                    </div>
                    <div className="features-product-info">
                      <h5>{product.productName}</h5>
                      {/* <p>${product.productPrice}</p> */}
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {userLoggedIn && (
          <section className="pick-where-left-off feature-section">
            <h3>Pick where you left off</h3>
            <div className="feature-cards">
              {recentlyPurchased.map((product) => (
                <div key={product.productId} className="features-product-card">
                  <a href={`/product/${product.productId}`}>
                    <div className="features-product-image">
                      <img
                        src={getImageUrl(product.productImage)}
                        alt={product.productName}
                      />
                    </div>
                    <div className="features-product-info">
                      <h5>{product.productName}</h5>
                      {/* <p>${product.productPrice}</p> */}
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default HeroBanner;
