import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ProductReview } from "../../interfaces/ProductReview";
import { faStar, faUser } from "@fortawesome/free-solid-svg-icons";
import StarRating from "./StarRating";
import { useState } from "react";

interface RatingAndReviewsProps {
  averageRating: number;
  totalReviews: number;
  reviews: ProductReview[];
}

export function RatingAndReviews({ reviews }: RatingAndReviewsProps) {
  const [sortOption, setSortOption] = useState<"recent" | "popular">("recent");
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortOption === "recent") {
      return (
        new Date(b.reviewDate!).getTime() - new Date(a.reviewDate!).getTime()
      );
    } else {
      return (b.productRating ?? 0) - (a.productRating ?? 0);
    }
  });
  return (
    <div className="reviews-list col-lg-8">
      <select
        className="sort-dropdown"
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value as "recent" | "popular")}
      >
        <option value="recent" key={1}>
          Most Recent
        </option>
        <option value="popular" key={2}>
          Most Popular
        </option>
      </select>
      {sortedReviews.map((review, index) => (
        <div key={index} className="review-card">
          <div>
            <FontAwesomeIcon icon={faUser}></FontAwesomeIcon>{" "}
            {review.customerName}
          </div>
          <StarRating
            rating={review.productRating || 0}
            size="regular"
          ></StarRating>
          <h4>{review.reviewHeadline}</h4>
          <p>{review.productReview}</p>
          {/* {review.image && <img src={review.image} alt="Review" />}
                      {review.video && (
                        <video controls>
                          <source src={review.video} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )} */}
        </div>
      ))}
      {sortedReviews.length === 0 && (
        <h2 className="no-reviews-text">No reviews available.</h2>
      )}
    </div>
  );
}
