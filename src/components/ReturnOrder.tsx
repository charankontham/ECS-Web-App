import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import "../css/ReturnOrder.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeftLong } from "@fortawesome/free-solid-svg-icons";
import {
  OrderTrackingStatusEnum,
  PAYMENT_METHOD_MAP,
  PaymentMethodEnum,
  RETURN_REASON_CATEGORY_MAP,
  ReturnReasonCategoryEnum,
} from "@src/util/util";
import { jwtDecode } from "jwt-decode";
import {
  Order,
  OrderItem,
  OrderItemEnriched,
  OrderReturn,
  OrderReturnRequest,
  OrderTracking,
} from "@interfaces/Order";
import Address from "@interfaces/Address";

interface ReturnOrderProps {
  order: Order;
  goBack: () => void;
}

const ReturnOrder: React.FC<ReturnOrderProps> = ({ order, goBack }) => {
  const authToken = localStorage.getItem("authToken");
  const customerApiBaseUrl = "http://localhost:8080/ecs-customer/api";
  const logisticsApiBaseUrl = "http://localhost:8080/ecs-logistics/api";
  const navigate = useNavigate();
  const [selectedOrderItem, setSelectedOrderItem] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [reasonExplanation, setReasonExplanation] = useState<string>("");
  const [refundMethod, setRefundMethod] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [charCount, setCharCount] = useState<number>(0);
  const [selectedQuantity, setReturnQuantity] = useState<number>(1);
  const [selectedPickupAddress, setPickupAddress] = useState<number>(0);
  const [addressList, setAddressList] = useState<Address[]>([]);
  const characterLimit = 10;

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    setReasonExplanation(input.trim());
    setCharCount(input.trim().length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedCategory ||
      !reasonExplanation ||
      !refundMethod ||
      selectedPickupAddress == 0 ||
      (order.orderItems.find((ot) => ot.orderItemId == selectedOrderItem)!
        .product.productQuantity! > 1 &&
        selectedQuantity == 0)
    ) {
      setError("Please complete all fields before submitting.");
      return;
    }

    setLoading(true);
    setError(null);

    const orderReturn: OrderReturnRequest = {
      OrderItemId: selectedOrderItem,
      CustomerId: order.customer.customerId!,
      ProductQuantity: selectedQuantity!,
      ReturnReasonCategoryId: Number(selectedCategory),
      ReturnReason: reasonExplanation,
      ReturnPaymentSourceId:
        Number(refundMethod) == 7 ? order.paymentType : Number(refundMethod),
      PickupAddressId: selectedPickupAddress,
    };

    try {
      const authToken = localStorage.getItem("authToken");
      const response = await axios.post(
        `${logisticsApiBaseUrl}/orderReturns`,
        orderReturn,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage(
          "Your return request has been submitted successfully!"
        );
        console.log("Order Return : ", response.data);
        setTimeout(() => navigate("/account/my-orders"), 2000);
      } else {
        setError("Something went wrong while submitting the return request.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to place return order. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItemAndAddress = async () => {
    try {
      if (authToken) {
        const decodedToken = jwtDecode(authToken);
        const email = decodedToken.sub;
        const currentTime = Date.now() / 1000;
        if ((decodedToken.exp ? decodedToken.exp : 0) >= currentTime) {
          var addressResponse = await axios.get(
            customerApiBaseUrl +
              `/address/getAllAddressByUserId/customer_${order.customer.customerId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          setAddressList(addressResponse.data);
        } else {
          console.log("Session Expired!");
          localStorage.setItem("authToken", "");
          navigate("/");
        }
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error: ", error);
      navigate("/signIn");
    }
  };

  const fetchOrderTracking = async (productId: number) => {
    try {
      if (authToken) {
        const decodedToken = jwtDecode(authToken);
        const email = decodedToken.sub;
        const currentTime = Date.now() / 1000;
        if ((decodedToken.exp ? decodedToken.exp : 0) >= currentTime) {
          return await axios.get(
            logisticsApiBaseUrl +
              `/orderTracking/getByOrderIdAndProductId/${order.orderId}/${productId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          // setAddressList(addressResponse.data);
        } else {
          console.log("Session Expired!");
          localStorage.setItem("authToken", "");
          navigate("/");
        }
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error: ", error);
      navigate("/signIn");
    }
  };

  function checkReturnWindow(orderItemId: number): boolean {
    const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;
    if (
      order.orderItems.find((ot) => ot.orderItemId == orderItemId)
        ?.orderItemStatus != OrderTrackingStatusEnum.Delivered
    )
      return false;
    fetchOrderTracking(
      order.orderItems.find((ot) => ot.orderItemId == orderItemId)!.product!
        .productId!
    ).then((response) => {
      if (
        (response?.data as OrderTracking[]).length == 1 &&
        (response?.data as OrderTracking[])[0].actualDeliveryDate?.getTime()! +
          THIRTY_DAYS_IN_MS >=
          Date.now()
      ) {
        return true;
      } else {
        return false;
      }
    });
    return false;
  }

  useEffect(() => {
    fetchOrderItemAndAddress();
  }, []);

  return (
    <div className="return-order-container">
      <a className="go-back-link" onClick={goBack}>
        <FontAwesomeIcon icon={faLeftLong}></FontAwesomeIcon> back
      </a>
      <div className="return-order-section">
        <Card className="p-4 return-order-card">
          <h4 className="text-center mb-4">Return Order</h4>

          {error && <Alert variant="danger">{error}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Select Order Item</Form.Label>
              <Form.Select
                value={selectedOrderItem}
                onChange={(e) => {
                  if (checkReturnWindow(Number(e.target.value))) {
                    setSelectedOrderItem(Number(e.target.value));
                  } else {
                    setError(
                      "Return Window is Closed/order item not eligible for return!"
                    );
                  }
                }}
              >
                <option value="0">-- Select Order Item --</option>
                {order.orderItems.map(
                  (orderItem, index) =>
                    orderItem.orderItemStatus ==
                      OrderTrackingStatusEnum.Delivered && (
                      <option
                        key={orderItem.orderItemId}
                        value={orderItem.orderItemId}
                      >
                        {orderItem.product.productName}
                      </option>
                    )
                )}
              </Form.Select>
            </Form.Group>

            {/* Step 0: Select Quantity */}
            {(order.orderItems.find((ot) => ot.orderItemId == selectedOrderItem)
              ?.product!.productQuantity ?? -1) > 1 && (
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  Select Product Quantity
                </Form.Label>
                <Form.Select
                  value={selectedQuantity}
                  onChange={(e) => setReturnQuantity(Number(e.target.value))}
                >
                  <option value="0">-- Select the Quantity --</option>
                  {Array.from({
                    length: order.orderItems.find(
                      (ot) => ot.orderItemId == selectedOrderItem
                    )!.product!.productQuantity,
                  }).map(
                    (_, index) =>
                      !isNaN(Number(index + 1)) && (
                        <option key={index + 1} value={index + 1}>
                          {index + 1}
                        </option>
                      )
                  )}
                </Form.Select>
              </Form.Group>
            )}

            {/* Step 1: Select Reason Category */}
            {selectedOrderItem > 0 && selectedQuantity >= 1 && (
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  Select Return Reason Category
                </Form.Label>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">-- Select a reason --</option>
                  {Object.keys(ReturnReasonCategoryEnum).map(
                    (reason, index) =>
                      !isNaN(Number(reason)) && (
                        <option key={index} value={reason}>
                          {RETURN_REASON_CATEGORY_MAP[Number(reason)]}
                        </option>
                      )
                  )}
                </Form.Select>
              </Form.Group>
            )}
            {/* Step 2: Explanation */}
            {selectedCategory && (
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  Explain your return reason
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Please explain your reason for returning this order item..."
                  // value={reasonExplanation}
                  onChange={handleReasonChange}
                />
                <div className="reason-feedback">
                  <small
                    className={`char-count ${
                      reasonExplanation.length >= characterLimit
                        ? "valid"
                        : "invalid"
                    }`}
                  >
                    {charCount}/{characterLimit}
                  </small>
                  {reasonExplanation.length < characterLimit && (
                    <small className="error-text">
                      Please enter at least {characterLimit} characters to
                      proceed.
                    </small>
                  )}
                </div>
              </Form.Group>
            )}
            {/* Step 3: Refund Method */}
            {reasonExplanation.length > characterLimit && (
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  Choose Refund Payment Method
                </Form.Label>
                <div className="refund-options">
                  {Object.keys(PaymentMethodEnum).map(
                    (method) =>
                      !isNaN(Number(method)) && (
                        <Form.Check
                          key={method}
                          type="radio"
                          label={PAYMENT_METHOD_MAP[Number(method)]}
                          name="refundMethod"
                          value={method}
                          checked={refundMethod === method}
                          onChange={(e) => setRefundMethod(e.target.value)}
                          className="mb-2"
                        />
                      )
                  )}
                </div>
              </Form.Group>
            )}
            {/* Step 4: Pickup Address */}
            {refundMethod && (
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  Select Pickup Address
                </Form.Label>
                <Form.Select
                  value={selectedPickupAddress}
                  onChange={(e) => setPickupAddress(Number(e.target.value))}
                >
                  <option value="0">-- Select the Pickup Address --</option>
                  {addressList.map((address, index) => (
                    <option key={address.addressId} value={address.addressId!}>
                      {address.name} | {address.street}, {address.city},{" "}
                      {address.contact}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}
            {/* Step 5: Submit */}
            {selectedPickupAddress > 0 && (
              <div className="text-center mt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="confirm-return-btn"
                >
                  {loading ? "Processing..." : "Confirm Return"}
                </Button>
              </div>
            )}
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ReturnOrder;
