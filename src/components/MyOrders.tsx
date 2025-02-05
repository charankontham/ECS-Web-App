import React, {
  ReactElement,
  ReactHTML,
  ReactHTMLElement,
  useEffect,
  useState,
} from "react";
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
  Button,
  Form,
  InputGroup,
  Pagination,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFileInvoice,
  faArrowRight,
  faArrowDown,
  faAngleDown,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Customer from "../interfaces/Customer";
import { Order, OrderItem } from "../interfaces/Order";
import Address from "../interfaces/Address";
import { Product } from "../interfaces/Product";
import * as bootstrap from "bootstrap";
import ViewOrderDetails from "./ViewOrderDetails";
import OrderTracking from "./OrderTracking";

const MyOrders: React.FC<{
  orderId?: string;
  orderFilterByDate?: string;
  orderFilterByStatus?: string;
  orderSearchByName?: string;
}> = ({ orderId }) => {
  const ordersPerPage = 2;
  const orderStatuses = [
    "Orders",
    "OrderPlaced",
    "Delivered",
    "Out-For-Delivery",
    "Shipped",
    "Cancelled",
    "Returned",
  ];
  const authToken = localStorage.getItem("authToken");
  const apiBaseUrl = "http://localhost:8080/ecs-order/api";
  const [myOrders, setMyOrders] = useState<Order[]>([]);
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
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [orderSearchBar, setOrderSearchBar] = useState("");
  const [orderDateRange, setOrderDateRange] = useState<string>("3-months");
  const [orderStatus, setOrderStatus] = useState<string>(orderStatuses[0]);
  const navigate = useNavigate();
  const last10Years: number[] = [];
  const [visibleTracker, setVisibleTracker] = useState<number | null>(null);
  const toggleTracker = (orderId: number) => {
    setVisibleTracker((prev) => (prev === orderId ? null : orderId));
  };
  for (let i = 0; i < 10; i++) {
    last10Years.push(currentYear - i);
  }

  const applyFilters = () => {
    const dateRangeFilteredOrders = filterOrdersByDateRange(myOrders);
    const statusFilteredOrders = filterOrdersByOrderStatus(
      // currentOrderStatus,
      dateRangeFilteredOrders
    );
    setCurrentOrders(statusFilteredOrders);
  };

  const filterOrdersByDateRange = (
    // dateRange: string,
    orders: Order[]
  ): Order[] => {
    let startDate: Date;
    let endDate: Date;
    const currentDate = new Date();
    const dateRange = orderDateRange;
    console.log("orderDateRange : ", orderDateRange);
    console.log("data range filkter : ", dateRange);
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
        endDate.setDate(endDate.getDay() + 1);
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
      (order) => order.orderDate >= startDate && order.orderDate < endDate
    );
  };

  const filterOrdersByOrderStatus = (orders: Order[]): Order[] => {
    const currentStatus = orderStatus;
    console.log(currentStatus);
    if (!orderStatuses.includes(currentStatus)) {
      console.log(
        `Invalid status: ${currentStatus}. Valid statuses are: ${orderStatuses.join(
          ", "
        )}`
      );
      throw new Error(
        `Invalid status: ${currentStatus}. Valid statuses are: ${orderStatuses.join(
          ", "
        )}`
      );
    }
    if (currentStatus === "Orders") {
      return orders;
    }
    return orders.filter((order) => order.shippingStatus === currentStatus);
  };

  const searchInOrders = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    console.log("Search Value : ", orderSearchBar);
    if (
      orderSearchBar.trim().length === 0 ||
      (orderSearchBar.trim().length < 3 && Number.isNaN(orderSearchBar.trim()))
    ) {
      console.log("null search or invalid search characters!");
      return;
    }
    const searchResults = myOrders.filter((order) => {
      if (findInAddress(order.shippingAddress)) {
        return true;
      } else if (
        findInDate(order.orderDate) ||
        findInDate(order.deliveryDate)
      ) {
        return true;
      } else if (
        order.orderId
          ?.toString()
          .toLowerCase()
          .includes(orderSearchBar.toLowerCase())
      ) {
        return true;
      } else if (findInOrderItems(order.orderItems)) {
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
          const myOrdersResponse = await axios.get(
            apiBaseUrl +
              `/order/getOrdersByCustomerId/${customerResponse.data.customerId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          myOrdersResponse.data.map((order: Order) => {
            const standardOrderDate = new Date(order.orderDate);
            const standardDeliveryDate = new Date(order.deliveryDate);
            order.orderDate = standardOrderDate;
            order.deliveryDate = standardDeliveryDate;
          });
          if (orderId) {
            const orders = myOrdersResponse.data.filter(
              (order: Order) =>
                Number.isSafeInteger(Number(orderId)) &&
                order.orderId === Number(orderId)
            );
            setMyOrders(orders);
            defaultCurrentOrders(orders);
          } else {
            setMyOrders(myOrdersResponse.data);
            defaultCurrentOrders(myOrdersResponse.data);
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
    startDate.setMonth(startDate.getMonth() - 3);
    console.log("printing myorders: ", orders);
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

  useEffect(() => {
    fetchCustomerAndOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orderDateRange, orderStatus]);

  const setBackToViewOrders = () => {
    setEnableViewOrderDetails(false);
  };

  return (
    <>
      {!enableViewOrderDetailsBlock && (
        <Container>
          <h2 className="my-4">My Orders</h2>
          {/* Filter Section */}
          <Row className="mb-4">
            <Col md={3}>
              <Form.Select
                aria-label="Date Range Filter"
                onChange={(e) => setOrderDateRange(e.target.value)}
                disabled={orderId ? true : false}
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
                onChange={(e) => setOrderStatus(e.target.value)}
                disabled={orderId ? true : false}
              >
                {orderStatuses.map((status: string) => (
                  <option value={status} key={status}>
                    {status}
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
          {currentPageOrders.map((order, index) => (
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
                  <div>
                    <span>Order Id # {order.orderId}</span>
                  </div>
                  <div className="order-card-header-links">
                    <a
                      href={`#`}
                      onClick={() =>
                        downloadFile(
                          order.orderId || -1,
                          `tooltip-${order.orderId}`
                        )
                      }
                      id={`tooltip-${order.orderId}`}
                      data-bs-toggle="tooltip"
                      data-bs-placement="bottom"
                      className="p-0"
                    >
                      <FontAwesomeIcon icon={faFileInvoice} className="me-2" />
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
                <div className="order-card-body">
                  <h5>{order.shippingStatus}</h5>
                  <a
                    href="#"
                    className="track-order-link"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleTracker(order.orderId);
                    }}
                  >
                    {visibleTracker === order.orderId
                      ? "Hide tracker"
                      : "Track order"}
                  </a>
                  {visibleTracker === order.orderId && (
                    <OrderTracking orderStatus={order.shippingStatus} />
                  )}
                  {order.orderItems.map((orderItem, index) => (
                    <div className="order-item-body" key={index}>
                      <Col md={4} className="order-item-img-column">
                        <img
                          src={
                            orderItem.productImage
                              ? "/src/assets/images/product-images/" +
                                orderItem.productImage
                              : ""
                          }
                          alt={orderItem.productName}
                          className="img-fluid rounded"
                        />
                      </Col>
                      <Col md={8} className="product-details">
                        <h5>
                          <a
                            href="#"
                            className="product-link"
                            onClick={() =>
                              navigate(`/product/${orderItem.productId}`)
                            }
                          >
                            {orderItem.productName}
                          </a>
                        </h5>
                        <div className="product-details-btns">
                          <Button size="sm" className="btn product-support-btn">
                            Get Product Support
                          </Button>
                          {/* <br /> */}
                          <Button size="sm" className="btn product-review-btn">
                            Write a Product Review
                          </Button>
                        </div>
                      </Col>
                      {index < order.orderItems.length - 1 && <hr />}
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          ))}

          {/* No Orders Message */}
          {currentOrders.length == 0 && (
            <h6 className="no-orders-placed">No orders placed!</h6>
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
    </>
  );
};

export default MyOrders;
