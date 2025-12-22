import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "@src/App.css";
import "../css/AccountSettings.css";
import "../css/MyOrders.css";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Pagination,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFileInvoice,
  faAngleDown,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Customer from "../interfaces/Customer";
import { Order, OrderReturn, OrderTrackingEnriched } from "../interfaces/Order";
import Address from "../interfaces/Address";
import { Product } from "../interfaces/Product";
import * as bootstrap from "bootstrap";
import ViewOrderDetails from "./ViewOrderDetails";
import { OrderTrackingObject } from "@interfaces/Logistics";
import { OrderTrackingStatusEnum } from "@src/util/util";
import ReturnOrder from "./ReturnOrder";
import OrderItemBody from "./order-item-body/order-item-body";
import { ScaleLoader } from "react-spinners";

const MyOrders: React.FC<{
  orderId?: string;
  orderFilterByDate?: string;
  orderFilterByStatus?: string;
  orderSearchByName?: string;
}> = ({ orderId }) => {
  const ordersPerPage = 2;
  const orderStatuses = [
    {
      id: 0,
      value: "Orders",
    },
    {
      id: 1,
      value: "Order Placed",
    },
    {
      id: 2,
      value: "In-Transit",
    },
    {
      id: 3,
      value: "Shipped",
    },
    {
      id: 4,
      value: "Waiting For Agent",
    },
    {
      id: 5,
      value: "Out For Delivery",
    },
    {
      id: 6,
      value: "Delivered",
    },
    {
      id: 7,
      value: "Cancelled",
    },
    {
      id: 8,
      value: "Returned",
    },
  ];
  const paymentStatuses = [
    { id: 1, value: "PaymentCompleted" },
    { id: 2, value: "PaymentPending" },
    { id: 3, value: "PaymentFailed" },
    { id: 4, value: "PaymentRefunded" },
    { id: 5, value: "PaymentCancelled" },
  ];
  const authToken = localStorage.getItem("authToken");
  const orderApiBaseUrl = "http://localhost:8080/ecs-order/api";
  const logisticsApiBaseUrl = "http://localhost:8080/ecs-logistics/api";
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [returnedOrders, setReturnedOrders] = useState<OrderReturn[]>([]);
  const [ordersTracking, setOrdersTracking] = useState<OrderTrackingObject[]>(
    []
  );
  const currentYear = new Date().getFullYear();
  const [currentOrders, setCurrentOrders] = useState<Order[]>([]);
  const totalPages = Math.ceil(currentOrders.length / ordersPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const currentPageOrders = currentOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [enableViewOrderDetailsBlock, setEnableViewOrderDetails] =
    useState<boolean>(false);
  const [enableReturnOrderBlock, setEnableReturnOrderBlock] =
    useState<boolean>(false);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [returnOrderDetails, setReturnOrderDetails] = useState<{
    order: Order;
  } | null>(null);
  const [isLoading, setLoader] = useState<boolean>(true);
  const [orderSearchBar, setOrderSearchBar] = useState("");
  const [orderDateRange, setOrderDateRange] = useState<string>("1-year");
  const [orderStatus, setOrderStatus] = useState<number>(orderStatuses[0].id);
  const navigate = useNavigate();
  const last10Years: number[] = [];
  const [visibleTracker, setVisibleTracker] = useState<string | null>(null);

  const toggleTracker = async (id: string) => {
    setVisibleTracker((prev) => (prev === id ? null : id));
    console.log("Ids: ", id.split("_"));
    const ids = id.split("_");
    const orderId = parseInt(ids[0]);
    const productId = parseInt(ids[1]);
    const trackingTypeId = parseInt(ids[2]);
    console.log("Orders tracking : ", ordersTracking);
    if (
      ordersTracking.find(
        (o) =>
          o.orderId === orderId &&
          o.productId === productId &&
          o.orderTracking?.orderTrackingType == trackingTypeId
      )
    ) {
      console.log("=== ");
      return;
    }
    await fetchOrderTracking(orderId, productId, trackingTypeId);
  };

  for (let i = 0; i < 10; i++) {
    last10Years.push(currentYear - i);
  }

  const applyFilters = () => {
    const dateRangeFilteredOrders = filterOrdersByDateRange(myOrders);
    const statusFilteredOrders = filterOrdersByOrderStatus(
      dateRangeFilteredOrders
    );
    setCurrentOrders(statusFilteredOrders);
  };

  const filterOrdersByDateRange = (orders: Order[]): Order[] => {
    let startDate: Date;
    let endDate: Date;
    const currentDate = new Date();
    const dateRange = orderDateRange;
    switch (dateRange.toLowerCase()) {
      case "6-months":
        startDate = new Date();
        endDate = new Date();
        startDate.setMonth(currentDate.getMonth() - 6);
        endDate.setDate(endDate.getDay() + 1);
        break;

      case "3-months":
        startDate = new Date();
        endDate = new Date();
        startDate.setMonth(currentDate.getMonth() - 3);
        endDate.setDate(endDate.getDay() + 1);
        break;

      case "1-year":
        startDate = new Date();
        endDate = new Date();
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;

      default:
        const year = parseInt(dateRange, 10);
        if (!isNaN(year) && year > 1900 && year <= currentDate.getFullYear()) {
          startDate = new Date(year, 0, 1);
          endDate = new Date(year + 1, 0, 1);
        } else {
          throw new Error(`Invalid date range: ${dateRange}`);
        }
    }
    return orders.filter(
      (order) => order.orderDate >= startDate && order.orderDate <= endDate
    );
  };

  const filterOrdersByOrderStatus = (orders: Order[]): Order[] => {
    if (!orderStatuses.find((status) => status.id === orderStatus)) {
      console.log(
        `Invalid status: ${orderStatus}. Valid statuses are: ${orderStatuses}`
      );
      throw new Error(
        `Invalid status: ${orderStatus}. Valid statuses are: ${orderStatuses.join(
          ", "
        )}`
      );
    }
    if (orderStatus == orderStatuses[0].id) {
      return orders;
    }
    return orders.filter(
      (order) =>
        order.orderStatus == orderStatus ||
        order.orderItems.find(
          (oi) =>
            oi.orderItemStatus == orderStatus ||
            returnedOrders.find((ro) => ro.orderItemId == oi.orderItemId) !=
              undefined
        ) != undefined
    );
  };

  const searchInOrders = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    console.log("Search Value : ", orderSearchBar);
    if (
      orderSearchBar.trim().length === 0 ||
      (orderSearchBar.trim().length < 3 && Number.isNaN(orderSearchBar.trim()))
    ) {
      console.log("null search or invalid search characters!");
      setCurrentOrders(myOrders);
      return;
    }
    const searchResults = myOrders.filter((order) => {
      if (findInAddress(order.shippingAddress)) {
        return true;
      } else if (
        findInDate(order.orderDate)
        // || findInDate(order.deliveryDate) // Temporarily disabled as deliveryDate not in order interface
      ) {
        return true;
      } else if (
        order.orderId
          ?.toString()
          .toLowerCase()
          .includes(orderSearchBar.toLowerCase())
      ) {
        return true;
      } else if (findInOrderItems(order.orderItems.map((oi) => oi.product))) {
        return true;
      } else return false;
    });

    setCurrentOrders(searchResults);

    function findInAddress(address: Address | null) {
      if (address?.city.toLowerCase().includes(orderSearchBar.toLowerCase())) {
        return true;
      } else if (address?.contact?.includes(orderSearchBar)) {
        return true;
      } else if (
        address?.country.toLowerCase().includes(orderSearchBar.toLowerCase())
      ) {
        return true;
      } else if (
        address?.name?.toLowerCase().includes(orderSearchBar.toLowerCase())
      ) {
        return true;
      } else if (
        address?.state.toLowerCase().includes(orderSearchBar.toLowerCase())
      ) {
        return true;
      } else if (
        address?.street.toLowerCase().includes(orderSearchBar.toLowerCase())
      ) {
        return true;
      } else if (address?.zip.includes(orderSearchBar)) {
        return true;
      } else {
        return false;
      }
    }

    function findInDate(date: Date) {
      if (
        date
          .toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })
          .toLowerCase()
          .includes(orderSearchBar.toLowerCase())
      ) {
        return true;
      } else {
        return false;
      }
    }

    function findInOrderItems(orderItems: Product[]) {
      return (
        orderItems.findIndex((orderItem) => {
          if (
            orderItem.productName
              .toLowerCase()
              .includes(orderSearchBar.toLowerCase())
          ) {
            return true;
          } else if (
            orderItem.brand.brandName
              .toLowerCase()
              .includes(orderSearchBar.toLowerCase())
          ) {
            return true;
          } else return false;
        }) !== -1
      );
    }
  };

  const downloadFile = async (invoiceId: number, tooltipId: string) => {
    try {
      const response = await axios.get(
        orderApiBaseUrl + `/order/downloadOrderInvoice/${invoiceId}`,
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
        setError(errorMessage);
      } else {
        setError(err.response.data);
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  function convertToPriceString(price: number): string {
    if (isNaN(price)) {
      throw new Error("Invalid input: price must be a valid number");
    }

    return `$${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  }

  const fetchCustomerAndOrders = async () => {
    try {
      if (authToken) {
        const decodedToken = jwtDecode(authToken);
        const email = decodedToken.sub;
        const currentTime = Date.now() / 1000;
        if ((decodedToken.exp ? decodedToken.exp : 0) >= currentTime) {
          const customerResponse = await axios.get(
            `http://localhost:8080/ecs-customer/api/customer/getByEmail/${email}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (customerResponse.status !== 200) {
            console.log(customerResponse.data);
            navigate("/signIn");
          }
          setCustomer(customerResponse.data);
          var myOrdersResponse = await axios.get(
            orderApiBaseUrl +
              `/order/getOrdersByCustomerId/${customerResponse.data.customerId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          const returnOrdersResponse = await axios.get(
            `http://localhost:8080/ecs-logistics/api/orderReturns/getAllOrderReturnsByCustomerId/${customerResponse.data.customerId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          myOrdersResponse.data.map((order: Order) => {
            const standardOrderDate = new Date(order.orderDate);
            order.orderDate = standardOrderDate;
          });
          setReturnedOrders(returnOrdersResponse.data);
          if (orderId) {
            const orders = myOrdersResponse.data.filter(
              (order: Order) =>
                Number.isSafeInteger(Number(orderId)) &&
                order.orderId === Number(orderId)
            );
            setMyOrders(orders);
            defaultCurrentOrders(orders);
            setLoader(false);
          } else {
            setMyOrders(myOrdersResponse.data);
            defaultCurrentOrders(myOrdersResponse.data);
            setLoader(false);
          }
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

  const defaultCurrentOrders = (orders: Order[]) => {
    let startDate: Date = new Date();
    startDate.setMonth(startDate.getMonth() - 12);
    const filteredOrders = orders.filter((order) => {
      return order.orderDate >= startDate;
    });
    setCurrentOrders(filteredOrders);
  };

  const viewOrderDetails = (order: Order) => {
    console.log("order details: ", order);
    setViewOrder(order);
    setEnableViewOrderDetails(true);
  };

  const fetchOrderTracking = async (
    orderId: number,
    productId: number,
    trackingTypeId: number
  ) => {
    if (
      ordersTracking.find(
        (o) =>
          o.orderId === orderId &&
          o.productId === productId &&
          o.orderTracking?.orderTrackingType == trackingTypeId
      )
    ) {
      return;
    }
    var myOrdersTrackingResponse = await axios.get(
      logisticsApiBaseUrl +
        `/orderTracking/getByOrderIdAndProductId/${orderId}/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (myOrdersTrackingResponse.status == 200) {
      console.log("tracking response: ", myOrdersTrackingResponse.data);
      setOrdersTracking((prev) => [
        ...prev,
        ...myOrdersTrackingResponse.data.map(
          (orderTrackingItem: OrderTrackingEnriched) =>
            ({
              orderId,
              productId,
              orderTracking: orderTrackingItem,
            } as OrderTrackingObject)
        ),
      ]);
    } else if (myOrdersTrackingResponse.status !== 200) {
      console.log("Session Expired!");
      localStorage.setItem("authToken", "");
      navigate("/");
    } else {
      setOrdersTracking((prev) => [
        ...prev,
        {
          orderId,
          productId,
          orderTracking: myOrdersTrackingResponse.data,
        } as OrderTrackingObject,
      ]);
    }
    return;
  };

  const returnOrder = (order: Order) => {
    setEnableReturnOrderBlock(true);
    setReturnOrderDetails({ order });
  };

  function isOrderItemReturned(orderItemId: number): boolean {
    return returnedOrders.find(
      (returnOrder) => returnOrder.orderItemId == orderItemId
    ) != undefined
      ? true
      : false;
  }

  function getReturnOrder(orderItemId: number): OrderReturn {
    return returnedOrders.find(
      (returnOrder) => returnOrder.orderItemId == orderItemId
    )!;
  }

  useEffect(() => {
    fetchCustomerAndOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orderDateRange, orderStatus]);

  const setBackToViewOrders = () => {
    setEnableViewOrderDetails(false);
    setEnableReturnOrderBlock(false);
  };

  return (
    <>
      {!enableViewOrderDetailsBlock && !enableReturnOrderBlock && (
        <Container>
          <h2 className="my-4">My Orders</h2>
          {/* Filter Section */}
          <Row className="mb-4">
            <Col md={3}>
              <Form.Select
                aria-label="Date Range Filter"
                onChange={(e) => setOrderDateRange(e.target.value)}
                disabled={orderId ? true : false}
                value={orderDateRange}
                key="dateRangeFilter"
              >
                <option value="3-months" key="3-months">
                  Last 3 Months
                </option>
                <option value="6-months" key="6-months">
                  Last 6 Months
                </option>
                <option value="1-year" key="1-year">
                  Last 1 Year
                </option>
                {last10Years.length > 0 &&
                  last10Years.map((year) => (
                    <option value={year} key={"" + year}>
                      {year}
                    </option>
                  ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                aria-label="Order Status Filter"
                key="orderStatusFilter"
                onChange={(e) => setOrderStatus(Number(e.target.value))}
                disabled={orderId ? true : false}
              >
                {orderStatuses.map((orderStatus) => (
                  <option value={orderStatus.id} key={orderStatus.id}>
                    {orderStatus.value}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6}>
              <form onSubmit={(e) => searchInOrders(e)}>
                <InputGroup>
                  <Form.Control
                    placeholder="Search orders"
                    aria-label="Search orders"
                    onChange={(e) => setOrderSearchBar(e.target.value)}
                    disabled={orderId ? true : false}
                  />
                  <button className="search-btn" type="submit">
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
                </InputGroup>
              </form>
            </Col>
          </Row>

          {/* Order Cards */}
          {!isLoading &&
            currentPageOrders.map((order, index) => (
              <Card className="mb-3 order-card" key={index}>
                <Card.Body>
                  {/* Order Details */}
                  <div className="order-card-header">
                    <div>
                      <span>Order Placed</span>{" "}
                      <p>{order.orderDate.toDateString()}</p>
                    </div>
                    <div>
                      <span>Total</span>{" "}
                      <p>{convertToPriceString(order.totalOrderValue)}</p>
                    </div>
                    <div>
                      <span>Ship To</span>{" "}
                      <p>
                        {order.shippingAddress?.name}{" "}
                        <FontAwesomeIcon icon={faAngleDown}></FontAwesomeIcon>
                      </p>
                    </div>
                    <div className="order-return-header">
                      <span>Order Id # {order.orderId}</span>
                      {order.orderStatus ==
                        OrderTrackingStatusEnum.Delivered && (
                        <a
                          className="return-order-link"
                          href="#"
                          onClick={() => returnOrder(order)}
                        >
                          {"Return"}
                          <FontAwesomeIcon
                            icon={faRotateLeft}
                          ></FontAwesomeIcon>
                        </a>
                      )}
                    </div>
                    <div className="order-card-header-links">
                      <a
                        href={`#`}
                        onClick={() =>
                          downloadFile(
                            order.invoiceId,
                            `tooltip-${order.invoiceId}`
                          )
                        }
                        id={`tooltip-${order.invoiceId}`}
                        data-bs-toggle="tooltip"
                        data-bs-placement="bottom"
                        className="p-0"
                      >
                        <FontAwesomeIcon
                          icon={faFileInvoice}
                          className="me-2"
                        />
                        Invoice{" "}
                        <FontAwesomeIcon icon={faAngleDown}></FontAwesomeIcon>
                      </a>
                      <br />
                      <a
                        href="#"
                        className="p-0"
                        onClick={() => viewOrderDetails(order)}
                      >
                        View order details
                      </a>
                    </div>
                  </div>
                  <div className="order-card-body" key={order.orderId}>
                    {order.orderItems.map((orderItem, index) => (
                      <OrderItemBody
                        key={index}
                        index={index}
                        productImage={orderItem.product.productImage}
                        productName={orderItem.product.productName}
                        productId={orderItem.product.productId}
                        orderItemQuantity={
                          isOrderItemReturned(orderItem.orderItemId)
                            ? getReturnOrder(orderItem.orderItemId)
                                .productQuantity
                            : orderItem.product.productQuantity
                        }
                        toggleTrackerParameter={
                          order.orderId +
                          "_" +
                          orderItem.product.productId +
                          (isOrderItemReturned(orderItem.orderItemId)
                            ? "_2"
                            : "_1")
                        }
                        toggleTracker={toggleTracker}
                        visibleTracker={visibleTracker}
                        orderTrackingId={
                          ordersTracking.find(
                            (ot) =>
                              ot.orderId === order.orderId &&
                              ot.productId === orderItem.product.productId &&
                              ot.orderTracking?.orderTrackingType ===
                                (isOrderItemReturned(orderItem.orderItemId)
                                  ? 2
                                  : 1)
                          )?.orderTracking?.orderTrackingId
                        }
                        orderTrackingObj={
                          ordersTracking.find(
                            (ot) =>
                              ot.orderId === order.orderId &&
                              ot.productId === orderItem.product.productId &&
                              ot.orderTracking?.orderTrackingType ===
                                (isOrderItemReturned(orderItem.orderItemId)
                                  ? 2
                                  : 1)
                          )?.orderTracking ?? null
                        }
                        orderTrackingStatus={
                          ordersTracking.find(
                            (ot) =>
                              ot.orderId === order.orderId &&
                              ot.productId === orderItem.product.productId &&
                              ot.orderTracking?.orderTrackingType ===
                                (isOrderItemReturned(orderItem.orderItemId)
                                  ? 2
                                  : 1)
                          )?.orderTracking?.orderTrackingStatusId ??
                          orderItem.orderItemStatus
                        }
                        orderItemsLength={order.orderItems.length}
                      ></OrderItemBody>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            ))}

          {/* No Orders Message */}
          {currentOrders.length == 0 && !isLoading && (
            <h6 className="no-orders-placed">No orders placed!</h6>
          )}

          {isLoading && (
            <div className="loading-div">
              <center>
                <ScaleLoader />
              </center>
            </div>
          )}

          {/* Pagination */}
          {currentOrders.length != 0 && (
            <Pagination className="justify-content-center">
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Pagination.Prev>
              {Array.from({ length: totalPages }).map((_, index) => (
                <Pagination.Item
                  key={index}
                  active={index + 1 === currentPage}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Pagination.Next>
            </Pagination>
          )}
        </Container>
      )}

      {enableViewOrderDetailsBlock && viewOrder && (
        <ViewOrderDetails
          order={viewOrder}
          goBack={setBackToViewOrders}
        ></ViewOrderDetails>
      )}

      {enableReturnOrderBlock && returnOrderDetails && (
        <ReturnOrder
          order={returnOrderDetails?.order!}
          goBack={setBackToViewOrders}
        ></ReturnOrder>
      )}
    </>
  );
};

export default MyOrders;
