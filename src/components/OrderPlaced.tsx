import React, { useEffect, useState } from "react";
import "../css/OrderPlaced.css";
import Confetti from "react-confetti";
import Header from "./home-common/Header";

const OrderPlaced: React.FC = () => {
  const [windowWidth, windowHeight] = [window.innerWidth, window.innerHeight];
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti animation after the component mounts
    setConfetti(true);
    // Automatically stop the confetti after 5 seconds
    const timeout = setTimeout(() => setConfetti(false), 5000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <Header></Header>
      <div className="order-placed-container">
        {/* Confetti Effect */}
        {confetti && <Confetti width={windowWidth} height={windowHeight} />}

        {/* Message Box */}
        <div className="order-placed-message">
          <h1>Order Placed Successfully! 🎉</h1>
          <p>
            Thank you for shopping with us! Your order has been placed and is
            being processed.
          </p>
          <div className="buttons-div">
            <button
              className="btn btn-primary"
              onClick={() => (window.location.href = "/")}
            >
              Continue Shopping
            </button>
            <button
              className="btn btn-warning"
              onClick={() => (window.location.href = "/account/my-orders")}
            >
              My Orders
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderPlaced;
