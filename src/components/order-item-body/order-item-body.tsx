import "bootstrap/dist/css/bootstrap.css";
import "@src/App.css";
import "../../css/AccountSettings.css";
import "../../css/MyOrders.css";

import OrderTracking from "@components/OrderTracking";
import { Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  ORDER_RETURN_STATUS_MAP,
  ORDER_TRACKING_STATUS_MAP,
} from "@src/util/util";
import { useEffect } from "react";
import $ from "jquery";
import { OrderTrackingEnriched } from "@interfaces/Order";
import { API_BASE_URL } from "../../util/api";

interface OrderItemBodyProps {
  index: number;
  productImage: string;
  productName: string;
  orderItemQuantity: number;
  productId: number | null;
  visibleTracker: string | null;
  orderTrackingId: string | undefined;
  orderTrackingObj: OrderTrackingEnriched | null;
  orderTrackingStatus: number;
  orderItemsLength: number;
  toggleTracker: (id: string) => Promise<void>;
  toggleTrackerParameter: string;
}

const OrderItemBody: React.FC<OrderItemBodyProps> = ({
  index,
  productImage,
  productName,
  orderItemQuantity,
  productId,
  visibleTracker,
  orderTrackingId,
  orderTrackingObj,
  orderTrackingStatus,
  orderItemsLength,
  toggleTracker,
  toggleTrackerParameter,
}) => {
  const navigate = useNavigate();
  const orderTypeId: number = Number(toggleTrackerParameter.split("_")[2]);
  const imageApiUrl = `${API_BASE_URL}/ecs-inventory-admin/api/public/images`;
  return (
    <div key={index}>
      <span
        className={`order-item-status ${
          orderTrackingObj?.orderTrackingStatusId
            ? "status-show"
            : orderTrackingStatus
            ? "status-show"
            : "status-hidden"
        }`}
      >
        {orderTypeId == 1
          ? ORDER_TRACKING_STATUS_MAP[
              orderTrackingObj?.orderTrackingStatusId ?? orderTrackingStatus
            ]
          : ORDER_RETURN_STATUS_MAP[
              orderTrackingObj?.orderTrackingStatusId ?? orderTrackingStatus
            ]}
      </span>
      <div className="order-item-body" key={index}>
        <Col md={3}>
          <div className="image-and-quantity-column">
            <div className="order-item-img-column">
              <img
                src={`${imageApiUrl}/view/getImageById/${productImage}`}
                alt={productName}
              />
            </div>
            {orderItemQuantity > 1 && (
              <span className="quantity-badge">{orderItemQuantity}</span>
            )}
          </div>
        </Col>
        <Col md={5} className="product-details">
          <h5>
            <a
              href="#"
              className="product-link"
              onClick={() => navigate(`/product/${productId}`)}
            >
              {productName}
            </a>
          </h5>
          <div className="product-details-btns">
            <Button size="sm" className="btn product-support-btn">
              Get Product Support
            </Button>
            <Button size="sm" className="btn product-review-btn">
              Write a Product Review
            </Button>
          </div>
        </Col>
        <Col md={4} className="order-tracking-link-column">
          <a
            href="#"
            className="track-order-link"
            onClick={async (e) => {
              e.preventDefault();
              await toggleTracker(toggleTrackerParameter);
            }}
          >
            {visibleTracker === toggleTrackerParameter
              ? "close tracker"
              : "view order tracker"}
          </a>
          <br />
          {visibleTracker === toggleTrackerParameter && (
            <>
              <span id="order-tracking-id-text">
                order-tracking-id#
                <br />
                <small>{orderTrackingId}</small>
              </span>

              <OrderTracking
                orderTrackingObj={orderTrackingObj}
                orderTypeId={orderTypeId}
              />
            </>
          )}
        </Col>
        {index < orderItemsLength - 1 && <hr />}
      </div>
    </div>
  );
};
export default OrderItemBody;
