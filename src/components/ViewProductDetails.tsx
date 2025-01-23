import React, { useEffect, useState } from "react";
import "../App.css";
import "../css/ProductsPage.css";
import "bootstrap/dist/css/bootstrap.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import { Product } from "../interfaces/Product";
import { useParams } from "react-router-dom";
import "../css/ProductDetails.css";
import ProductImagesBlock from "./ProductImagesBlock";
import Header from "./Header";
import ProductCategoryBar from "./ProductCategoriesBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faCartShopping,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import ProductsPage from "./ProductsPage";
import AllCategories from "./AllCategories";
import { Product } from "../interfaces/Product";
import Customer from "../interfaces/Customer";
import { jwtDecode } from "jwt-decode";
import { CartItem } from "../interfaces/Cart";
import { Order } from "../interfaces/Order";

// interface Product {
//   brand: string;
//   name: string;
//   price: number;
//   images: string[];
//   description: string;
//   specifications: Record<string, string>;
//   rating: number;
//   reviews: Review[];
//   similarProducts: ProductSummary[];
// }

interface Review {
  subject: string;
  description: string;
  rating: number;
  image?: string;
  video?: string;
}

interface ProductSummary {
  id: string;
  name: string;
  image: string;
  price: number;
}

const ViewProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [productDetails, setProductDetails] = useState<Product | null>(null);
  const apiBaseURL = "http://localhost:8080";
  const [productCategoryId, setProductCategoryId] = useState(-1);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const cartApiBaseURL = "http://localhost:8080/ecs-order/api/cart";
  const [selectedProductQuantity, setSelectedProductQuantity] =
    useState<number>(1);
  const quantities = [1, 2, 3, 4, 5];
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);
  const [myOrder, setMyOrders] = useState<Order[]>([]);
  const navigate = useNavigate();
  const [isPopupVisible, setPopupVisible] = useState(false);
  const reviews: Review[] = [
    {
      subject: "Super...",
      description:
        "A good product, i suggest everyone to choose fastrack black leather watch",
      rating: 3.5,
    },
    {
      subject: "Awesome",
      description:
        "Its an awesome product by the fastrcak. it works really well. thankyou fastrack",
      rating: 4.0,
    },
    {
      subject: "Wonderful product",
      description: "great product from fastrcak brand...",
      rating: 4.5,
    },
    {
      subject: "Bad product",
      description:
        "I don't like the product much, because quality is not upto the mark",
      rating: 1,
    },
  ];
  const similarProducts: ProductSummary[] = [
    {
      id: "34",
      name: "pd-34",
      image: "samsung_galaxy_s23_ultra_12gb_256gb_2.jpg",
      price: 5,
    },
    {
      id: "35",
      name: "pd-35",
      image: "fastrack_leather_watch_brown_1.jpg",
      price: 6,
    },
    {
      id: "36",
      name: "pd-36",
      image: "fastrack_leather_watch_brown_1.jpg",
      price: 7,
    },
    {
      id: "37",
      name: "pd-37",
      image: "fastrack_leather_watch_brown_1.jpg",
      price: 8,
    },
    {
      id: "38",
      name: "pd-38",
      image: "fastrack_leather_watch_brown_1.jpg",
      price: 9,
    },
  ];
  const specs: Record<string, string> = {
    weight: "2kgs",
    dimensions: "12 x 86 x 50",
    warranty: "2 years",
    color: "black",
  };

  const authToken = localStorage.getItem("authToken");

  // const product: Product = {
  //   brand: "fastrack",
  //   description: "fastrcak watches are the biggest brand in india",
  //   images: [
  //     "fastrack_leather_watch_brown_1.jpg",
  //     "AUTOMET_womens_long_sleeve_shirt_top_outfit_womens_6.jpg",
  //     "samsung_galaxy_s23_ultra_12gb_256gb_2.jpg",
  //     "samsung_galaxy_s23_ultra_12gb_256gb_2.jpg",
  //     "samsung_galaxy_s23_ultra_12gb_256gb_2.jpg",
  //     "samsung_galaxy_s23_ultra_12gb_256gb_2.jpg",
  //     "samsung_galaxy_s23_ultra_12gb_256gb_2.jpg",
  //     "samsung_galaxy_s23_ultra_12gb_256gb_2.jpg",
  //     "samsung_galaxy_s23_ultra_12gb_256gb_2.jpg",
  //   ],
  //   name: "Fastrack black leather watch",
  //   price: 45.99,
  //   rating: 4.5,
  //   reviews: reviews,
  //   similarProducts: similarProducts,
  //   specifications: specs,
  // };

  useEffect(() => {
    fetchCustomerAndOrders();
  }, []);

  useEffect(() => {
    setProductCategoryId(-1);
    try {
      axios
        .get(apiBaseURL + "/ecs-product/api/product/" + productId)
        .then((response) => {
          setProductDetails(response.data);
        })
        .catch((err) => {
          console.log("Error in response catch: ", err);
        });
    } catch (error) {
      console.log("Error in try catch block : ", error);
    }
  }, [productId]);

  const fetchCustomerAndOrders = async () => {
    if (authToken) {
      const decodedToken = jwtDecode(authToken);
      const email = decodedToken.sub;
      const currentTime = Date.now() / 1000;
      if ((decodedToken.exp ? decodedToken.exp : 0) >= currentTime) {
        const customerResponse = await axios.get(
          apiBaseURL + `/ecs-customer/api/customer/getByEmail/${email}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (customerResponse.status == 200) {
          setCustomer(customerResponse.data);
        }

        const myOrdersResponse = await axios.get(
          apiBaseURL +
            `/ecs-order/api/order/getOrdersByCustomerId/${customerResponse.data.customerId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        myOrdersResponse.data.map((order: Order) => {
          const standardOrderDate = new Date(order.orderDate);
          const standardDeliveryDate = new Date(order.deliveryDate);
          order.orderDate = standardOrderDate;
          order.deliveryDate = standardDeliveryDate;
        });
        setMyOrders(myOrdersResponse.data);
        // let orderHistoryList: Order[] = [];
        let recentOrderDate: Date = new Date("1970-01-01");
        myOrdersResponse.data.find((order: Order) => {
          if (
            order.orderItems.find((item: Product) => {
              return item.productId == parseInt(productId || "-1");
            })
          ) {
            if (order.orderDate.getTime() > recentOrderDate.getTime()) {
              recentOrderDate = order.orderDate;
              setRecentOrder(order);
            }
            // orderHistoryList.push(order);
          }
        });
      } else {
        console.log("Session Expired!");
        localStorage.setItem("authToken", "");
      }
    }
  };

  const StarRating = (rating: number, maxStars: number = 5) => {
    const stars = [];

    for (let i = 1; i <= maxStars; i++) {
      if (rating >= i) {
        // Full star
        stars.push(
          <span key={i} className="star full">
            <FontAwesomeIcon icon={faStar} />
          </span>
        );
      } else if (rating >= i - 0.5) {
        // Half star
        stars.push(
          <span key={i} className="star half">
            <div className="dd">
              <span className="half-filled">
                <FontAwesomeIcon icon={faStar} />
              </span>
              <span className="half-empty">
                <FontAwesomeIcon icon={faStar} />
              </span>
            </div>
          </span>
        );
      } else {
        // Empty star
        stars.push(
          <span key={i} className="star empty">
            <FontAwesomeIcon icon={faStar} />
          </span>
        );
      }
    }

    return (
      <div className="star-rating">
        {rating} {stars}
      </div>
    );
  };

  const setCategoryId = (id: number) => {
    setProductCategoryId(id);
  };

  const showPopup = () => {
    setPopupVisible(true);
    setTimeout(() => {
      setPopupVisible(false);
    }, 2000);
  };

  const addToCart = (productId: number) => {
    console.log("Adding product to cart : ", productId);
    if (customer != null && productId !== -1) {
      const cartItems = [
        {
          customerId: customer?.customerId,
          productId: productId,
          quantity: selectedProductQuantity,
        },
      ];
      console.log("quantity : ", selectedProductQuantity);
      const cartObject = {
        customerId: customer?.customerId,
        cartItems: cartItems,
      };
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
      navigate("/signIn");
    }
  };

  const buyNow = (productId: number) => {
    if (customer != null && productDetails != null && productId !== -1) {
      const itemForCheckout: CartItem = {
        cartItemId: null,
        productDetails: productDetails,
        orderQuantity: selectedProductQuantity,
      };
      localStorage.setItem(
        "itemsForCheckout",
        JSON.stringify([itemForCheckout])
      );
      let subTotal = productDetails.productPrice * selectedProductQuantity;
      localStorage.setItem("subTotal", subTotal.toString());
      console.log("Navigated to Checkout Page!");
      navigate("/checkout");
    } else {
      console.log("Please login first");
      navigate("/signIn");
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

      {recentOrder && (
        <div className="container last-purchased-div">
          {" "}
          Last purchased on {recentOrder.orderDate.toDateString()},{" "}
          <a className="view-recent-order-link" href="/account/my-orders">
            view order
          </a>
        </div>
      )}

      {productCategoryId == -1 && (
        <div className="product-container">
          <div className="product-intro">
            {/* Product Images */}
            <div className="product-images">
              <ProductImagesBlock
                images={
                  productDetails == null
                    ? []
                    : [
                        productDetails?.productImage,
                        "hello",
                        "world",
                        "Test1",
                        "Test2",
                        "Test3",
                        "Test4",
                      ]
                }
              ></ProductImagesBlock>
            </div>

            {/* Product Info */}
            <div className="product-info">
              <div className="basic-details">
                <h1>{productDetails?.productName}</h1>
                <h2>by {productDetails?.brand.brandName}</h2>
                <div className="product-rating">
                  <span> {StarRating(3.5)} </span> |{" "}
                  <a href="#">11,056 ratings</a>
                </div>
                <p> 3k+ bought in last month</p>
                <hr></hr>
                <p className="product-price">
                  ${productDetails?.productPrice.toFixed(2)}
                </p>
                <p className="product-description">
                  {productDetails?.productDescription}
                </p>
              </div>
              <div className="product-features">
                <strong>Features</strong>
                <p>1. very good wrist watch</p>
              </div>
            </div>

            <div className="buy-product-options">
              <div className="pd-5">
                <strong>FREE Delivery</strong>{" "}
                <span>Get it by Tuesday, order within 7 hours</span>
                <br />
                <strong>Fast Delivery | Shipping Fee $6.99</strong>{" "}
                <span>Get it by Tomorrow </span>
                <br />
                <span>
                  Zip Code: <a href="#">33496</a>
                </span>
                {productDetails?.productQuantity != undefined &&
                  productDetails?.productQuantity > 0 && (
                    <p className="in-stock">In Stock</p>
                  )}
                {productDetails?.productQuantity == undefined ||
                  (productDetails.productQuantity <= 0 && (
                    <p className="out-of-stock">Out of Stock</p>
                  ))}
                <select
                  className="select-quantity btn"
                  value={selectedProductQuantity}
                  id="quantity-select"
                  onChange={(e) =>
                    setSelectedProductQuantity(parseInt(e.target.value))
                  }
                >
                  <option value={selectedProductQuantity}>
                    Quantity: {selectedProductQuantity}
                  </option>
                  {quantities.map(
                    (quantity) =>
                      quantity !== selectedProductQuantity && (
                        <option key={quantity} value={quantity}>
                          {quantity}
                        </option>
                      )
                  )}
                </select>
                <div className="product-actions">
                  <button
                    className="btn btn-add-to-cart"
                    disabled={
                      productDetails && productDetails?.productQuantity <= 0
                        ? true
                        : false
                    }
                    onClick={() => addToCart(productDetails?.productId || -1)}
                  >
                    <FontAwesomeIcon icon={faCartShopping}></FontAwesomeIcon>{" "}
                    Add to Cart
                  </button>
                  <button
                    className="btn btn-buy-now"
                    disabled={
                      productDetails &&
                      productDetails?.productQuantity <= selectedProductQuantity
                        ? true
                        : false
                    }
                    onClick={() => buyNow(productDetails?.productId || -1)}
                  >
                    <FontAwesomeIcon icon={faBolt}></FontAwesomeIcon> Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Specifications */}
          <div className="product-specifications">
            <h3>Product Specifications</h3>
            <hr />
            <table className="table table-striped">
              {/* {product-specifications-table} */}
              <tbody>
                {Object.entries(specs).map(([key, value], index) => (
                  <tr>
                    <td>
                      <strong>{key}</strong>
                    </td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Similar Products */}
          <div className="similar-products">
            <h3>Similar Products</h3>
            <hr />
            <div className="similar-products-list">
              {similarProducts.map((similarProduct) => (
                <div key={similarProduct.id} className="similar-product-card">
                  <img
                    src={
                      similarProduct.image
                        ? "/src/assets/images/product-images/" +
                          similarProduct.image
                        : ""
                    }
                    alt={similarProduct.name}
                  />
                  <h4>{similarProduct.name}</h4>
                  <p>${similarProduct.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
            {/* <ProductsPage type="similar-products" value={12}></ProductsPage> */}
          </div>

          {/* Product Ratings & Reviews */}
          <div className="product-reviews">
            <h3>Ratings & Reviews</h3>
            <hr />
            <p>Average Rating: {4} / 5</p>
            <button className="btn btn-write-review">Write a Review</button>

            <div className="reviews-list">
              {reviews.map((review, index) => (
                <div key={index} className="review-card">
                  <h4>{review.subject}</h4>
                  <p>{review.description}</p>
                  <p>Rating: {review.rating} / 5</p>
                  {review.image && <img src={review.image} alt="Review" />}
                  {review.video && (
                    <video controls>
                      <source src={review.video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {productCategoryId == 0 && (
        <AllCategories
          setProductCategoryId={setProductCategoryId}
        ></AllCategories>
      )}

      {productCategoryId > 0 && (
        <ProductsPage
          type={"category"}
          value={productCategoryId}
        ></ProductsPage>
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
    </>
  );
};

export default ViewProductDetails;
