import React from "react";
import "../css/OrderTracking.css";

interface OrderStage {
  status: string;
  //   label: string;
  date: string;
}

const OrderTracking: React.FC<{ orderStatus: string }> = ({ orderStatus }) => {
  const orderStages: OrderStage[] = [
    { status: "Order Placed", date: "01/18/2025" },
    { status: "Ready for Shipping", date: "01/19/2025" },
    { status: "Shipped", date: "01/20/2025" },
    { status: "Reached to nearest Delivery Hub", date: "01/21/2025" },
    { status: "Out for Delivery", date: "01/22/2025" },
  ];

  const currentStageIndex: number =
    orderStages.findIndex((stage) => stage.status == orderStatus) + 1;

  return (
    <div className="tracking-container">
      <div className="tracking-timeline">
        {orderStages.map((stage, index) => (
          <div
            key={index + 1}
            className={`tracking-stage ${
              index + 1 <= currentStageIndex ? "completed" : ""
            }`}
          >
            <div className="tracking-dot"></div>
            <div className="tracking-details">
              <p className="tracking-status">{stage.status}</p>
              <p className="tracking-date">{stage.date}</p>
            </div>
            {index + 1 <= orderStages.length &&
              index + 1 != orderStages.length && (
                <div
                  className={`tracking-line ${
                    index + 1 < currentStageIndex ? "completed" : ""
                  }`}
                ></div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderTracking;
