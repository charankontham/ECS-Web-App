import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.css";
import "@src/App.css";
import "@css/ProductReviews.css";
import "@css/StarRatingRealtime.css";
import { Button, Card, Form, Spinner } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import Customer from "../../interfaces/Customer";
import { useNavigate } from "react-router-dom";
import { ProductReview } from "../../interfaces/ProductReview";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeftLong, faStar } from "@fortawesome/free-solid-svg-icons";
import StarRatingRealtime from "./StarRatingRealtime";
import { API_BASE_URL } from "../../util/api";

interface Product {
  productId: number;
  productName: string;
  productImage: string;
}

const ProductReviews: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [review, setReview] = useState<ProductReview>({
    customerId: customer?.customerId || 0,
    customerName: customer?.customerName || "Noname User",
    productRating: 0,
    reviewHeadline: "",
    productReview: "",
  });
  const [loading, setLoading] = useState(false);
  const [myOrderedProducts, setMyOrderedProducts] = useState<Product[]>([]);
  const [myReviews, setMyReviews] = useState<ProductReview[]>([]);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const authToken = localStorage.getItem("authToken");
  const navigate = useNavigate();
  const customerApiUrl = API_BASE_URL + "/ecs-customer/api/customer";
  const reviewsApiUrl = API_BASE_URL + "/ecs-reviews/api/productReview";
  const orderApiUrl = API_BASE_URL + "/ecs-order/api/order";
  const imageApiUrl = API_BASE_URL + "/ecs-inventory-admin/api/public/images";

  useEffect(() => {
    setLoading(true);
    fetchCustomerReviews();
  }, []);

  const fetchProductReview = async (productId: number) => {
    setLoading(true);
    var existingReview = myReviews.find(
      (review) =>
        review.productId != undefined && review.productId === productId
    );
    if (existingReview) {
      if (existingReview.productReview == null)
        existingReview.productReview = "";
      if (existingReview.reviewHeadline == null)
        existingReview.reviewHeadline = "";
      console.log("updated review: ", existingReview);
      setReview(existingReview);
    }
    setLoading(false);
  };

  const handleProductClick = (product: Product) => {
    fetchProductReview(product.productId);
    setSelectedProduct(product);
  };

  const fetchCustomerReviews = async () => {
    try {
      if (authToken) {
        const decodedToken = jwtDecode(authToken);
        const email = decodedToken.sub;
        const currentTime = Date.now() / 1000;
        if ((decodedToken.exp ? decodedToken.exp : 0) >= currentTime) {
          try {
            const customerResponse = await axios.get(
              `${customerApiUrl}/getByEmail/${email}`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            setCustomer(customerResponse.data);
            setReview((prevReview) => ({
              ...prevReview,
              customerId: customerResponse.data.customerId,
              customerName: customerResponse.data.customerName,
            }));
            if (customerResponse.status !== 200) {
              console.log(customerResponse.data);
              navigate("/signIn");
            }
            const myOrderItemsResponse = await axios.get(
              `${orderApiUrl}/getOrderItemsByCustomerId/${customerResponse.data.customerId}`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            setMyOrderedProducts(myOrderItemsResponse.data);
            const myReviewsResponse = await axios.get(
              `${reviewsApiUrl}/getReviewsByCustomerId/${customerResponse.data.customerId}`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            setMyReviews(myReviewsResponse.data);
            setLoading(false);
          } catch (error) {
            console.error("Error page: ", error);
            navigate("/");
          }
        } else {
          console.log("Session Expired!");
          navigate("/signIn");
        }
      } else {
        navigate("/signIn");
      }
    } catch (error) {
      console.error("Error: ", error);
      navigate("/signIn");
    }
  };

  const handleReviewChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setReview((prevReview) => ({
      ...prevReview,
      [name]: value,
      productId: selectedProduct?.productId,
      customerId: customer?.customerId || 0,
      customerName: customer?.customerName || "Noname User",
    }));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (review.productReview?.trim() == "" || review.productRating == 0) {
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 2000);
      return;
    }
    setLoading(true);
    if (authToken) {
      const decodedToken = jwtDecode(authToken);
      const currentTime = Date.now() / 1000;
      if ((decodedToken.exp ? decodedToken.exp : 0) >= currentTime) {
        if (
          review.reviewHeadline == null ||
          review.reviewHeadline == "" ||
          review.productReview == null ||
          review.productReview == ""
        ) {
          setError(true);
          setTimeout(() => {
            setError(false);
          }, 2000);
          return;
        }
        if (review.reviewId != null || review.reviewId != undefined) {
          updateReview(review);
        } else {
          postReview(review);
        }
      } else {
        console.log("Session Expired!");
        navigate("/signIn");
      }
    } else {
      console.log("Logged out!");
      navigate("/");
    }
    setLoading(false);
  };

  const goBack = () => {
    setSelectedProduct(null);
    setReview({
      customerId: customer?.customerId || 0,
      customerName: customer?.customerName || "Noname User",
      productRating: 0,
      reviewHeadline: "",
      productReview: "",
    });
  };

  const setRating = (rating: number, productId: number) => {
    setReview((prevReview) => ({
      ...prevReview,
      productRating: rating,
    }));
    if (
      rating == 0 ||
      myReviews.find((review) => review.productId === productId)
        ?.productRating == rating
    ) {
      return;
    }
    let myReview = myReviews.find((review) => review.productId === productId);
    if (!myReview) {
      myReview = {
        productId: productId,
        productRating: rating,
        customerId: customer?.customerId || 0,
        customerName: customer?.customerName || "Noname User",
      };
    } else {
      myReview.productRating = rating;
    }
    if (authToken) {
      const decodedToken = jwtDecode(authToken);
      const currentTime = Date.now() / 1000;
      if ((decodedToken.exp ? decodedToken.exp : 0) >= currentTime) {
        myReview.customerId = customer?.customerId || 0;
        if (myReview.reviewId) {
          updateReview(myReview, true);
        } else {
          postReview(myReview, true);
        }
      } else {
        console.log("Session Expired!");
        navigate("/signIn");
      }
    } else {
      console.log("User not loggedIn!");
      navigate("/signIn");
    }
  };

  const postReview = (myReview: ProductReview, ratingOnly?: boolean) => {
    axios
      .post(reviewsApiUrl, myReview, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        if (response.status == 201) {
          console.log("Review saved successfully!");
          setMyReviews((prevReviews) => [...prevReviews, response.data]);
          if (ratingOnly) {
            setReview(response.data);
            setRatingSubmitted(true);
            setTimeout(() => {
              setRatingSubmitted(false);
            }, 2000);
          } else {
            setSelectedProduct(null);
            setReviewSubmitted(true);
            setTimeout(() => {
              setReviewSubmitted(false);
            }, 2000);
          }
        }
      })
      .catch((error) => {
        console.error("Error: ", error.response.data);
      });
  };

  const updateReview = (myReview: ProductReview, ratingOnly?: boolean) => {
    axios
      .put(reviewsApiUrl, myReview, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        if (response.status == 200) {
          console.log("Review saved successfully!");
          setMyReviews((prevReviews) =>
            prevReviews.map((currReview) =>
              currReview.productId == response.data.productId
                ? response.data
                : currReview
            )
          );
          if (ratingOnly) {
            setReview(response.data);
            setRatingSubmitted(true);
            setTimeout(() => {
              setRatingSubmitted(false);
            }, 2000);
          } else {
            setSelectedProduct(null);
            setReviewSubmitted(true);
            setTimeout(() => {
              setReviewSubmitted(false);
            }, 2000);
          }
        }
      })
      .catch((error) => {
        console.error("Error: ", error.response.data);
      });
  };

  const deleteReview = (reviewId: number) => {
    axios
      .delete(`${reviewsApiUrl}/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        if (response.status == 200) {
          setSelectedProduct(null);
          setMyReviews((prevReviews) =>
            prevReviews.filter((currReview) => currReview.reviewId !== reviewId)
          );
          console.log("Response : ", response.data);
        } else {
          console.log("Not successful!  :", response.data);
        }
      })
      .catch((error) => {
        console.log("Error deleting the review: ", error);
      });
  };

  return (
    <div className="product-reviews-container">
      <h1 className="text-center mb-4">Product Reviews</h1>

      {/* List of Purchased Products */}
      {!selectedProduct && !reviewSubmitted && (
        <div className="products-list">
          {loading ? (
            <Spinner animation="border" />
          ) : (
            myOrderedProducts.map((product: Product) => (
              <div key={product.productId}>
                <div className="review-product-link" key={product.productId}>
                  <img
                    src={`${imageApiUrl}/view/getImageById/${product.productImage}`}
                    alt={product.productName}
                  />
                  <div className="product-review-list-view">
                    <p
                      className="product-review-link-name"
                      onClick={() => handleProductClick(product)}
                    >
                      {product.productName}
                    </p>
                    <StarRatingRealtime
                      setRatingR={setRating}
                      productId={product.productId}
                      currentRating={
                        myReviews.find(
                          (review) => review.productId === product.productId
                        )?.productRating || 0
                      }
                    ></StarRatingRealtime>
                    {ratingSubmitted &&
                      product.productId == review.productId && (
                        <div style={{ color: "green" }}>Submitted!</div>
                      )}
                  </div>
                </div>
                <hr />
              </div>
            ))
          )}
        </div>
      )}

      {/* Review Form */}
      {selectedProduct && (
        <div className="review-section">
          <a className="go-back-link" onClick={goBack}>
            <FontAwesomeIcon icon={faLeftLong}></FontAwesomeIcon> back
          </a>
          <br />
          <div className="product-heading">
            <img
              src={`${imageApiUrl}/view/getImageById/${selectedProduct.productImage}`}
              alt={selectedProduct.productName}
            ></img>
            <p>{selectedProduct.productName}</p>
          </div>
          <form name="reviewForm" onSubmit={handleReviewSubmit}>
            <StarRatingRealtime
              setRatingR={setRating}
              productId={selectedProduct.productId}
              currentRating={
                myReviews.find(
                  (review) => review.productId == selectedProduct.productId
                )?.productRating || 0
              }
            ></StarRatingRealtime>

            {ratingSubmitted && <div style={{ color: "green" }}>Submitted</div>}

            <Form.Group controlId="headline" className="mt-3">
              <Form.Label>Add a headline</Form.Label>
              <input
                type="text"
                name="reviewHeadline"
                value={review.reviewHeadline}
                onChange={(e) => handleReviewChange(e)}
                placeholder="Add a brief headline for your review, ex: nice, worst, etc"
                className="form-control"
                required
              />
            </Form.Group>

            <Form.Group controlId="review" className="mt-3">
              <Form.Label>Add a review</Form.Label>
              <textarea
                name="productReview"
                value={review.productReview}
                onChange={(e) => handleReviewChange(e)}
                rows={3}
                className="form-control"
                placeholder="Write your detailed review here"
                required
              />
            </Form.Group>

            {error && (
              <div style={{ color: "red" }}>
                Please fill rating, headline, review
              </div>
            )}

            <Button
              className="mt-3"
              variant="success"
              type="submit"
              disabled={loading}
            >
              {review.reviewId ? "Update Review" : "Submit Review"}
            </Button>

            {review.reviewId && (
              <button
                type="button"
                className="btn btn-danger delete-review-btn"
                onClick={() => deleteReview(review.reviewId || 0)}
              >
                {" "}
                Delete review
              </button>
            )}
          </form>
        </div>
      )}

      {reviewSubmitted && (
        <div className="review-success-message">
          Review Submitted Successfully! &#x2713;
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
