import React from "react";
import "../css/OrderTracking.css";

interface OrderStage {
  id: number;
  value: string;
}

const OrderTracking: React.FC<{ orderTrackingStatus: number }> = ({
  orderTrackingStatus,
}) => {
  const orderStages: OrderStage[] = [
    {
      id: 1,
      value: "OrderPlaced",
    },
    {
      id: 2,
      value: "ShipmentInTransit",
    },
    {
      id: 3,
      value: "Shipped",
    },
    {
      id: 4,
      value: "WaitingForDeliveryAgent",
    },
    {
      id: 5,
      value: "OutForDelivery",
    },
    {
      id: 6,
      value: "Delivered",
    },
    {
      id: 7,
      value: "Cancelled",
    },
  ];

  if (orderTrackingStatus < 7) {
    orderStages.pop();
  }

  const orderReturnStages: OrderStage[] = [
    {
      id: 8,
      value: "ReadyForPickup",
    },
    {
      id: 9,
      value: "DeliveryAgentOnTheWay",
    },
    {
      id: 10,
      value: "OrderPickedUp",
    },
    {
      id: 11,
      value: "ReturnedToWarehouse",
    },
    {
      id: 12,
      value: "RefundInitiated",
    },
    {
      id: 13,
      value: "RefundCompleted",
    },
    {
      id: 14,
      value: "Returned",
    },
  ];

  const currentStageIndex: number =
    orderStages.findIndex((stage) => stage.id == orderTrackingStatus) + 1;

  return (
    <div className="tracking-container">
      <div className="tracking-timeline">
        {orderStages.map(
          (stage, index) =>
            (currentStageIndex > 6 && (index < 2 || index == 6)) ||
            (currentStageIndex <= 6 && index != 6 && (
              <div
                key={index + 1}
                className={`tracking-stage ${
                  index + 1 <= currentStageIndex ? "completed" : ""
                }`}
              >
                <div className="tracking-dot"></div>
                <div className="tracking-details">
                  <p className="tracking-status">{stage.value}</p>
                  <p className="tracking-date">01/01/1999</p>
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
            ))
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
