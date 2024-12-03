import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "../App.css";
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
} from "@fortawesome/free-solid-svg-icons";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Customer from "../interfaces/Customer";
import { Order } from "../interfaces/Order";

const MyOrders = () => {
  const ordersPerPage = 2; // Maximum number of orders per page
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [orderSearchBar, setOrderSearchBar] = useState("");
  const apiBaseUrl = "http://localhost:8080/ecs-order/api";
  const authToken = localStorage.getItem("authToken");
  const totalPages = Math.ceil(myOrders.length / ordersPerPage);
  const navigate = useNavigate();
  const orderStatus = [
    "All",
    "Delivered",
    "Out-For-Delivery",
    "Shipped",
    "Cancelled",
    "Returned",
  ];
  const currentOrders = myOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );
  const currentYear = new Date().getFullYear();
  const last10Years: number[] = [];
  for (let i = 0; i < 10; i++) {
    last10Years.push(currentYear - i);
  }

  const filterOrdersByDateRange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedOption = event.target.value;
    console.log(selectedOption);
  };

  const filterOrdersByOrderStatus = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedOption = event.target.value;
    console.log(selectedOption);
  };

  const searchInOrders = () => {
    console.log("Search Value : ", orderSearchBar);
  };

  const downloadFile = async (orderId: number) => {
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
    } catch (error: any) {
      if (error.response.data instanceof Blob) {
        const errorMessage = await error.response.data.text();
        setError(errorMessage);
      } else {
        setError(error.response.data);
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
          console.log(myOrdersResponse.data);
          myOrdersResponse.data.map((order: Order) => {
            const standardOrderDate = new Date(order.orderDate);
            const standardDeliveryDate = new Date(order.deliveryDate);
            order.orderDate = standardOrderDate;
            order.deliveryDate = standardDeliveryDate;
          });
          setMyOrders(myOrdersResponse.data);
        } else {
          console.log("Session Expired!");
          localStorage.setItem("authToken", "");
          navigate("/signIn");
        }
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error: ", error);
      navigate("/signIn");
    }
  };

  useEffect(() => {
    fetchCustomerAndOrders();
  }, []);

  return (
    <Container>
      <h2 className="my-4">My Orders</h2>
      {/* Filter Section */}
      <Row className="mb-4">
        <Col md={4}>
          <Form.Select
            aria-label="Date Range Filter"
            onChange={filterOrdersByDateRange}
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
                <option value={year} key={year}>
                  {year}
                </option>
              ))}
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Select
            aria-label="Order Status Filter"
            key="statusFilter"
            onChange={filterOrdersByOrderStatus}
          >
            {orderStatus.map((status: string) => (
              <option value={status} key={status}>
                {status}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={4}>
          <InputGroup>
            <Form.Control
              placeholder="Search orders"
              aria-label="Search orders"
              onChange={(e) => setOrderSearchBar(e.target.value)}
            />
            <Button variant="outline-secondary" onClick={searchInOrders}>
              <FontAwesomeIcon icon={faSearch} />
            </Button>
          </InputGroup>
        </Col>
      </Row>

      {/* Order Cards */}
      {currentOrders.map((order, index) => (
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
                  href="#"
                  onClick={() => downloadFile(order.orderId || -1)}
                  className="p-0"
                >
                  <FontAwesomeIcon icon={faFileInvoice} className="me-2" />
                  Invoice <FontAwesomeIcon icon={faAngleDown}></FontAwesomeIcon>
                </a>
                <br />
                <a href="#" className="p-0">
                  View order details
                </a>
              </div>
              {/* {error && <p className="errorMessage">{error}</p>} */}
            </div>
            <div className="order-card-body">
              {order.orderItems.map((orderItem, index) => (
                <div className="order-item-body">
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
                      <a href="#" className="product-link">
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

      {/* Pagination */}
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
    </Container>
  );
};

export default MyOrders;
