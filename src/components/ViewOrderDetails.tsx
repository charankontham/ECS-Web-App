import React, {
  ReactElement,
  ReactHTML,
  ReactHTMLElement,
  useEffect,
  useState,
} from "react";
import "bootstrap/dist/css/bootstrap.css";
import "../App.css";
import "../css/AccountSettings.css";
import "../css/ViewOrderDetails.css";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Pagination,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faLeftLong,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Customer from "../interfaces/Customer";
import { Order, OrderItem } from "../interfaces/Order";
import Address from "../interfaces/Address";
import { Product } from "../interfaces/Product";
import * as bootstrap from "bootstrap";

interface ViewOrderDetailsProps {
  order: Order;
  goBack: () => void;
}

const ViewOrderDetails: React.FC<ViewOrderDetailsProps> = ({
  order,
  goBack,
}) => {
  const authToken = localStorage.getItem("authToken");
  const apiBaseUrl = "http://localhost:8080/ecs-order/api";

  const downloadFile = async (orderId: number, tooltipId: string) => {
    try {
      const response = await axios.get(
        apiBaseUrl + `/order/downloadOrderInvoice/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/pdf",
          },
          responseType: "blob",
        }
      );
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
      URL.revokeObjectURL(pdfUrl);
    } catch (err: any) {
      var errorMessage;
      if (err.response.data instanceof Blob) {
        errorMessage = await err.response.data.text();
      } else {
        errorMessage = err.response.data;
      }
      const tooltipTriggerEl = document.getElementById(tooltipId);
      if (tooltipTriggerEl) {
        const existingTooltip = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
        if (existingTooltip) {
          existingTooltip.dispose();
        }
        const tooltipInstance = new bootstrap.Tooltip(tooltipTriggerEl, {
          html: true,
          title: `<div style="display":"flex"; "flexDirection": "column"; "alignItems": "flex-start";>
          <p>${errorMessage}</p>
          <a href="#" class="popup-close-btn btn" id="close-tooltip-${orderId}">close</a>
        </div>`,
          placement: "bottom",
          trigger: "manual",
        });

        tooltipInstance.show();
        setTimeout(() => {
          const closeButton = document.getElementById(
            `close-tooltip-${orderId}`
          );
          closeButton?.addEventListener("click", () => {
            tooltipInstance.hide();
          });
        }, 0);
      }
    }
  };

  return (
    <div className="order-details-container">
      <a className="go-back-link" onClick={goBack}>
        <FontAwesomeIcon icon={faLeftLong}></FontAwesomeIcon> back
      </a>
      <h2 className="order-details-title">Order Details</h2>
      <div className="order-details-section">
        <div className="order-meta">
          <p>Ordered on {order.orderDate.toDateString()}</p>
          <p>
            OrderID# {order.orderId} |{" "}
            <a
              href="#"
              onClick={() =>
                downloadFile(order.orderId || -1, `tooltip-${order.orderId}`)
              }
              id={`tooltip-${order.orderId}`}
              data-bs-toggle="tooltip"
              data-bs-placement="bottom"
            >
              Invoice <FontAwesomeIcon icon={faAngleDown}></FontAwesomeIcon>
            </a>
          </p>
        </div>

        <div className="order-summary-header">
          <div className="shipping-address">
            <h6>Shipping Address</h6>
            <p>{order.shippingAddress?.name}</p>
            <p>{order.shippingAddress?.street}</p>
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
              {order.shippingAddress?.zip}
            </p>
            <p>{order.shippingAddress?.country}</p>
          </div>
          <div className="payment-method">
            <h6>Payment Methods</h6>
            <p>{order.paymentType}</p>
          </div>
          <div className="order-summary">
            <h6>Order Summary</h6>
            <table className="order-summary-table">
              <tbody>
                <tr>
                  <td>Item(s) Subtotal:</td>
                  <td>${order.itemsSubTotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Shipping:</td>
                  <td>${order.shippingFee.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Tax:</td>
                  <td>${order.totalTax.toFixed(2)}</td>
                </tr>
                <tr className="order-total-row">
                  <td>
                    <strong>Total:</strong>
                  </td>
                  <td>
                    <strong>${order.totalOrderValue.toFixed(2)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="order-items">
        <h4>Ordered Products</h4>
        {order.orderItems.map((orderItem, index) => (
          <div className="order-item" key={index}>
            <div>
              <img
                src={
                  orderItem.productImage
                    ? "/src/assets/images/product-images/" +
                      orderItem.productImage
                    : ""
                }
                alt={orderItem.productName}
                className="order-item-image"
              />
            </div>
            <div className="order-item-details">
              <h4>
                <a href="#">{orderItem.productName}</a>
              </h4>
              <p>${orderItem.productPrice.toFixed(2)}</p>
              <p>Quantity: {orderItem.productQuantity}</p>
              <div className="order-item-actions">
                <button className="btn support-btn">Product Support</button>
                <button className="btn review-btn">Product Review</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewOrderDetails;
