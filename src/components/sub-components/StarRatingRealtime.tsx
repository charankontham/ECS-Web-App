import {
  faBorderAll,
  faBorderStyle,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";

interface StarRatingRealtimeProps {
  productId: number;
  currentRating: number;
  setRatingR: (rating: number, productId: number) => void;
}

const StarRatingRealtime: React.FC<StarRatingRealtimeProps> = ({
  setRatingR,
  productId,
  currentRating,
}) => {
  const [rating, setRating] = useState(currentRating);
  const [hover, setHover] = useState(0);
  const totalStars = 5;
  useEffect(() => {
    if (currentRating != rating) {
      setRatingR(rating, productId);
    }
  }, [rating]);

  return (
    <div className="star-rating">
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={index}
            className={`star ${starValue <= (hover || rating) ? "filled" : ""}`}
            onClick={() => setRating(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

export default StarRatingRealtime;
