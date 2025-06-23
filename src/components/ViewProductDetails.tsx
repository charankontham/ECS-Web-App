import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "@src/App.css";
import "../css/ProductsPage.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../css/ProductDetails.css";
import ProductImagesBlock from "./ProductImagesBlock";
import Header from "./home-common/Header";
import ProductCategoryBar from "./ProductCategoriesBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { Product } from "../interfaces/Product";
import Customer from "../interfaces/Customer";
import { jwtDecode } from "jwt-decode";
import { CartItem } from "../interfaces/Cart";
import { Order } from "../interfaces/Order";
import { ProductReview } from "../interfaces/ProductReview";
import { RatingAndReviews } from "./reviews-and-ratings/RatingAndReviews";
import StarRating from "./reviews-and-ratings/StarRating";

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
  const [customer, setCustomer] = useState<Customer | null>(null);
  const cartApiBaseURL = "http://localhost:8080/ecs-order/api/cart";
  const [selectedProductQuantity, setSelectedProductQuantity] =
    useState<number>(1);
  const quantities = [1, 2, 3, 4, 5];
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);
  const navigate = useNavigate();
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  // const similarProducts: ProductSummary[] = [
  //   {
  //     id: "34",
  //     name: "pd-34",
  //     image: "samsung_galaxy_s23_ultra_12gb_256gb_2.jpg",
  //     price: 5,
  //   },
  //   {
  //     id: "35",
  //     name: "pd-35",
  //     image: "fastrack_leather_watch_brown_1.jpg",
  //     price: 6,
  //   },
  //   {
  //     id: "36",
  //     name: "pd-36",
  //     image: "fastrack_leather_watch_brown_1.jpg",
  //     price: 7,
  //   },
  //   {
  //     id: "37",
  //     name: "pd-37",
  //     image: "fastrack_leather_watch_brown_1.jpg",
  //     price: 8,
  //   },
  //   {
  //     id: "38",
  //     name: "pd-38",
  //     image: "fastrack_leather_watch_brown_1.jpg",
  //     price: 9,
  //   },
  // ];
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
    fetchCustomerOrdersAndReviews();
  }, []);

  useEffect(() => {
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

  const setRecentOrderFunction = (
    currentProductId: number,
    orders: Order[]
  ) => {
    var recentOrderDate: Date = new Date("1970-01-01");
    const recentOrders = orders.filter((order: Order) => {
      return order.orderItems.find((item: Product) => {
        return item.productId == currentProductId;
      });
    });
    recentOrders.map((order: Order) => {
      if (order.orderDate.getTime() > recentOrderDate.getTime()) {
        recentOrderDate = order.orderDate;
        setRecentOrder(order);
      }
    });
    if (recentOrders.length < 1) {
      setRecentOrder(null);
    }
  };

  const fetchCustomerOrdersAndReviews = async () => {
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
        } else {
          console.log("Error data : ", customerResponse.data);
        }
        getmyOrders(customerResponse.data.customerId).then((orders) => {
          setRecentOrderFunction(Number(productId), orders);
        });
      } else {
        console.log("Session Expired!");
        localStorage.setItem("authToken", "");
      }
    }
    const productReviewsResponse = await axios.get(
      apiBaseURL +
        `/ecs-reviews/api/productReview/getReviewsByProductId/${productId}`
    );
    setProductReviews(productReviewsResponse.data);
    const similarProductsResponse = await axios.get(
      apiBaseURL +
        `/ecs-product/api/product/getSimilarProductsById/${productId}`
    );
    setSimilarProducts(similarProductsResponse.data);
  };

  function calculateAverageRating(reviews: ProductReview[]): number {
    if (reviews.length === 0) {
      return 0;
    }

    const totalRating: number = reviews.reduce(
      (sum, review) => sum + (review.productRating || 0),
      0
    );
    return totalRating / reviews.length;
  }

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

  const getmyOrders = async (customerId: number): Promise<Order[]> => {
    if (authToken) {
      const decodedToken = jwtDecode(authToken);
      const email = decodedToken.sub;
      const currentTime = Date.now() / 1000;
      if ((decodedToken.exp ? decodedToken.exp : 0) >= currentTime) {
        const myOrdersResponse = await axios.get(
          apiBaseURL +
            `/ecs-order/api/order/getOrdersByCustomerId/${customerId}`,
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
        return myOrdersResponse.data;
      } else {
        return [];
      }
    } else {
      return [];
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

      {recentOrder && recentOrder != null && (
        <div className="container last-purchased-div">
          {" "}
          Last purchased on {recentOrder.orderDate.toDateString()},{" "}
          <a
            className="view-recent-order-link"
            href={`/account/my-orders?orderId=${recentOrder.orderId}`}
          >
            view order
          </a>
        </div>
      )}

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
                {calculateAverageRating(productReviews).toFixed(1)}{" "}
                <StarRating
                  rating={calculateAverageRating(productReviews)}
                  size="regular"
                />{" "}
                |{" "}
                <a href="#product-reviews">
                  {productReviews.length}{" "}
                  {productReviews.length > 1 ? "ratings" : "rating"}
                </a>
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
                  <FontAwesomeIcon icon={faCartShopping}></FontAwesomeIcon> Add
                  to Cart
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
                <tr key={index}>
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
              <a href={"/product/" + similarProduct.productId}>
                <div
                  key={similarProduct.productId}
                  className="similar-product-card"
                  // onClick={() => navigate("/product/" + similarProduct.productId)}
                >
                  <img
                    src={`http://localhost:8080/ecs-inventory-admin/api/public/images/view/getImageById/${similarProduct.productImage}`}
                    alt={similarProduct.productName}
                  />
                  <h5 className="product-title">
                    {similarProduct.productName}
                  </h5>
                  <p>${similarProduct.productPrice.toFixed(2)}</p>
                </div>
              </a>
            ))}
          </div>
          {/* <ProductsPage type="similar-products" value={12}></ProductsPage> */}
        </div>

        {/* Product Ratings & Reviews */}
        <div className="product-reviews" id="product-reviews">
          <h3>Ratings & Reviews</h3>
          <hr />
          <div className="flex-gap-15">
            <div className="col-lg-3">
              <div className="average-product-rating">
                <div className="flex-gap-15">
                  <StarRating
                    rating={calculateAverageRating(productReviews)}
                    size="large"
                  />
                  <span className="h5-font">
                    {calculateAverageRating(productReviews)} out of 5{" "}
                  </span>
                </div>
                <span className="global-ratings-font">
                  {productReviews.length}{" "}
                  {productReviews.length > 1
                    ? "global ratings"
                    : "global rating"}
                </span>
              </div>
              {recentOrder && (
                <div className="write-review">
                  <div> Want to share your review with others?</div>
                  <a
                    href="/account/my-reviews"
                    className="btn btn-info btn-write-review"
                  >
                    Write review
                  </a>
                </div>
              )}
            </div>
            <RatingAndReviews
              averageRating={calculateAverageRating(productReviews)}
              totalReviews={productReviews.length}
              reviews={productReviews}
            />
          </div>
        </div>
      </div>

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
