import React from "react";
import "../css/OrderTracking.css";
import { OrderTrackingEnriched } from "@interfaces/Order";

interface OrderStage {
  id: number;
  value: string;
}

const OrderTracking: React.FC<{
  orderTrackingObj: OrderTrackingEnriched | null;
  orderTypeId?: number;
}> = ({ orderTrackingObj, orderTypeId = 1 }) => {
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

  const orderReturnStages: OrderStage[] = [
    {
      id: 1,
      value: "Return Requested",
    },
    {
      id: 2,
      value: "Return Accepted",
    },
    {
      id: 3,
      value: "Ready For Pickup",
    },
    {
      id: 4,
      value: "Waiting For Agent",
    },
    {
      id: 5,
      value: "Out For Pickup",
    },
    {
      id: 6,
      value: "Refund Issued",
    },
    {
      id: 7,
      value: "Returned",
    },
  ];

  const currentStageIndex: number =
    (orderTypeId == 1 ? orderStages : orderReturnStages).findIndex(
      (stage) => stage.id == orderTrackingObj?.orderTrackingStatusId
    ) + 1;

  if (orderTrackingObj?.orderTrackingStatusId! < 7) {
    if (orderTypeId == 1) orderStages.pop();
  }

  return (
    <div className="tracking-container">
      <div className="tracking-timeline">
        {(orderTypeId == 1 ? orderStages : orderReturnStages).map(
          (stage, index) =>
            ((currentStageIndex == 7 && (index < 1 || index == 6)) ||
              (currentStageIndex <= 6 && index != 6) ||
              orderTypeId == 2) && (
              <div
                key={index + 1}
                className={`tracking-stage ${
                  index + 1 <= currentStageIndex
                    ? index + 1 == 7
                      ? "cancelled"
                      : "completed"
                    : ""
                }`}
              >
                <div className="tracking-dot"></div>
                <div className="tracking-details">
                  <p className="tracking-status">{stage.value}</p>
                  <p className="tracking-date">
                    {orderTrackingObj?.actualDeliveryDate?.toLocaleString() ??
                      "01/01/1999"}
                  </p>
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
            )
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
