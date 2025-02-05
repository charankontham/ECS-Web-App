import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import "@css/StarRating.css";

const StarRating: React.FC<{
  rating: number;
  size: string;
}> = ({ rating, size }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(
        <span
          key={i}
          className={`full ${
            size == "large" ? "star-view-larger star-view" : "star-view"
          }`}
        >
          <FontAwesomeIcon icon={faStar} />
        </span>
      );
    } else if (rating >= i - 0.5) {
      stars.push(
        <span
          key={i}
          className={`${
            size == "large" ? "star-view-larger star-view" : "star-view"
          } half`}
        >
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
      stars.push(
        <span
          key={i}
          className={`empty ${
            size == "large" ? "star-view-larger star-view" : "star-view"
          }`}
        >
          <FontAwesomeIcon icon={faStar} />
        </span>
      );
    }
  }

  return <div className="star-rating-view">{stars}</div>;
};

export default StarRating;
