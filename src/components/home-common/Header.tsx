import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "@src/App.css";
import "../../css/Header.css";
import {
  faGears,
  faShoppingCart,
  faSign,
  faSignIn,
  faSliders,
  faUser,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Customer from "../../interfaces/Customer";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Cart } from "../../interfaces/Cart";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import SearchBar from "./SearchBar";
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Divider,
  Button,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Notification } from "@interfaces/Notification";
import CloseIcon from "@mui/icons-material/Close";
import { API_BASE_URL } from "../../util/api";

const Header: React.FC = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationAnchor, setNotificationAnchor] =
    useState<HTMLButtonElement | null>(null);
  const authToken = localStorage.getItem("authToken");
  const navigate = useNavigate();
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const notificationOpen = Boolean(notificationAnchor);
  const [sessionTime, setSessionTime] = useState<number>(0);
  const myPort = 8080;
  const appDomain = window.location.protocol + "//" + window.location.hostname;

  const handleNotificationClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleClearNotification = (
    notificationId: number,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    if (sessionTime >= Date.now() / 1000) {
      axios
        .delete(
          "http://localhost:8080/ecs-notification/api/userNotifications/removeNotificationMessage",
          {
            params: {
              userId: customer ? customer.customerId : undefined,
              messageId: notificationId,
            },
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          if (response.status === 204) {
            setNotifications((prev) =>
              prev.filter((n) => n.messageId !== notificationId)
            );
          } else {
            console.error(
              "Failed to delete notification on server, status code:",
              response.status
            );
          }
        })
        .catch((err) => {
          console.error("Error deleting notification:", err);
        });
    }
  };

  const clearAllNotifications = () => {
    if (sessionTime >= Date.now() / 1000) {
      axios
        .delete(
          `http://localhost:8080/ecs-notification/api/userNotifications/clearAllMessagesByUserId/${
            customer!.customerId
          }`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          if (response.status === 204) {
            setNotifications([]);
          } else {
            console.error(
              "Failed to clear all notification on server, status code:",
              response.status
            );
          }
        })
        .catch((err) => {
          console.error("Error deleting all notification:", err);
        });
    }
  };

  const handleNotificationItemClick = (notificationId: number) => {
    if (sessionTime >= Date.now() / 1000) {
      axios
        .patch(
          "http://localhost:8080/ecs-notification/api/userNotifications/updateNotificationReadStatus",
          null,
          {
            params: {
              userId: customer ? customer.customerId : undefined,
              messageId: notificationId,
            },
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          if (response.status === 200 && response.data === true) {
            setNotifications((prev) =>
              prev.map((n) =>
                n.messageId === notificationId ? { ...n, isRead: true } : n
              )
            );
            navigate(
              notifications.find((n) => n.messageId === notificationId)!
                .messageLink
            );
          }
        })
        .catch((err) => {
          console.error("Error updating notification read status:", err);
        });
    }
  };

  const fetchCustomerCartAndNotifications = async () => {
    try {
      if (authToken) {
        const decodedToken = jwtDecode(authToken);
        setSessionTime(decodedToken.exp ? decodedToken.exp : 0);
        const email = decodedToken.sub;
        const currentTime = Date.now() / 1000;
        if ((decodedToken.exp ? decodedToken.exp : 0) >= currentTime) {
          try {
            const customerResponse = await axios.get(
              `${appDomain}:${myPort}/ecs-customer/api/customer/getByEmail/${email}`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            setCustomer(customerResponse.data);

            const cartResponse = await axios.get(
              `http://localhost:8080/ecs-order/api/cart/getCartByCustomerId/${customerResponse.data.customerId}`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            setCart(cartResponse.data);
            const notificationResponse = await axios.get(
              `http://localhost:8080/ecs-notification/api/userNotifications/getByUserId/${customerResponse.data.customerId}`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            if (notificationResponse.status === 200) {
              setNotifications(
                notificationResponse.data.notificationMessages.reverse()
              );
            } else {
              setNotifications([]);
            }
          } catch (error) {
            console.error("Error: ", error);
          }
        } else {
          console.log("Session Expired!");
        }
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  const showCart = () => {
    navigate("/cart");
  };

  useEffect(() => {
    fetchCustomerCartAndNotifications();
    if (sessionTime < Date.now() / 1000) return;
    const cartSocket = new SockJS("http://localhost:8093/ws");
    const notificationSocket = new SockJS(
      `http://localhost:8096/ws-notifications?token=${authToken}`
    );
    const cartStompClient = new Client({
      webSocketFactory: () => cartSocket,
      connectHeaders: {
        Authorization: `Bearer ${authToken}`,
      },
      onConnect: () => {
        cartStompClient.subscribe("/topic/messages", (message: any) => {
          const updatedCart = JSON.parse(message.body);
          // console.log("Cart from web socket : ", updatedCart);
          setCart(updatedCart);
        });
      },
      onDisconnect: () => {
        console.log("Disconnected from cart WebSocket");
      },
      onStompError: (frame) => {
        console.error(
          "Cart - Broker reported error:",
          frame.headers["message"]
        );
      },
      debug: (str) => {
        // console.log(str);
      },
    });

    const notificationStompClient = new Client({
      webSocketFactory: () => notificationSocket,
      connectHeaders: {
        Authorization: `Bearer ${authToken}`,
      },

      onConnect: () => {
        console.log("Notification WebSocket connected!");
        notificationStompClient.subscribe(
          "/user/queue/notifications",
          (message: any) => {
            console.log("Notification message body: ", message);
            const newNotification = JSON.parse(message.body);
            console.log("Notification from web socket : ", newNotification);
            setNotifications(newNotification.notificationMessages.reverse());
          }
        );
      },
      onDisconnect: () => {
        console.log("Disconnected from notification WebSocket");
      },
      onStompError: (frame) => {
        console.error(
          "Notification - Broker reported error:",
          frame.headers["message"]
        );
      },
    });

    cartStompClient.activate();
    notificationStompClient.activate();
    return () => {
      if (cartStompClient.connected) {
        cartStompClient.deactivate();
      }
      if (notificationStompClient.connected) {
        notificationStompClient.deactivate();
      }
    };
  }, []);

  return (
    <header className="header">
      <div className="logo">
        <a href="/">ECS-Shopper</a>
      </div>
      <SearchBar />
      <div className="header-buttons">
        {customer ? (
          <div className="user-info" onClick={() => navigate("/account")}>
            <span className="user-name">
              Hello, {customer.customerName?.split(" ")[0]}
            </span>
            <span className="account-settings">
              Account <FontAwesomeIcon icon={faGears} />
            </span>
          </div>
        ) : (
          <>
            <button
              className="btn btn-warning sign-in-btn"
              onClick={() => navigate("/signIn")}
            >
              Sign In <FontAwesomeIcon icon={faSignIn} />
            </button>
          </>
        )}
        <IconButton
          onClick={handleNotificationClick}
          sx={{ marginLeft: 2, color: "#333" }}
          aria-label="notifications"
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon fontSize="large" />
          </Badge>
        </IconButton>

        <Popover
          open={notificationOpen}
          anchorEl={notificationAnchor}
          onClose={handleNotificationClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          sx={{
            "& .MuiPopover-paper": {
              width: 400,
              maxHeight: 500,
              marginTop: 1,
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              borderRadius: 2,
              zIndex: 9999,
            },
          }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Typography variant="caption" color="text.secondary">
                  You have {unreadCount} unread notification
                  {unreadCount > 1 ? "s" : ""}
                </Typography>
              )}
            </Box>
            {notifications.length > 0 && (
              <Button
                size="small"
                onClick={clearAllNotifications}
                sx={{
                  textTransform: "none",
                  color: "#d32f2f",
                  "&:hover": {
                    backgroundColor: "#ffebee",
                  },
                }}
              >
                Clear All
              </Button>
            )}
          </Box>

          {customer && notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <NotificationsIcon sx={{ fontSize: 48, color: "#ccc", mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                No notifications yet
              </Typography>
              <Typography variant="caption" color="text.secondary">
                We'll notify you when something arrives
              </Typography>
            </Box>
          ) : (
            customer && (
              <List sx={{ p: 0, maxHeight: 400, overflowY: "auto" }}>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.messageId}>
                    <ListItem
                      onClick={() =>
                        handleNotificationItemClick(notification.messageId)
                      }
                      sx={{
                        backgroundColor: notification.isRead
                          ? "transparent"
                          : "#f0f7ff",
                        "&:hover": {
                          backgroundColor: notification.isRead
                            ? "#f5f5f5"
                            : "#e3f2fd",
                        },
                        transition: "background-color 0.2s",
                        cursor: "pointer",
                        pr: 1,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: notification.isRead ? 400 : 600,
                              color: notification.isRead
                                ? "text.secondary"
                                : "text.primary",
                            }}
                          >
                            {notification.title}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.5 }}
                            >
                              {notification.description}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.disabled"
                              sx={{ mt: 0.5, display: "block" }}
                            >
                              {new Date(
                                notification.createdAt
                              ).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {!notification.isRead && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor: "#1976d2",
                              ml: 1,
                            }}
                          />
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) =>
                            handleClearNotification(notification.messageId, e)
                          }
                          sx={{
                            padding: "4px",
                            "&:hover": {
                              backgroundColor: "rgba(211, 47, 47, 0.1)",
                              color: "#d32f2f",
                            },
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )
          )}
          {!customer && (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <NotificationsIcon sx={{ fontSize: 48, color: "#ccc", mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                <a href="/signIn">Sign In</a>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Sign In to see the notifications!
              </Typography>
            </Box>
          )}
        </Popover>

        <div className="cart-icon-container" onClick={showCart}>
          <FontAwesomeIcon icon={faShoppingCart} size="2xl"></FontAwesomeIcon>
          {cart && cart?.cartItems.length != 0 && (
            <span className="cart-badge">{cart?.cartItems.length}</span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
