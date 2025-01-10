import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "../App.css";
import Header from "./Header";
import "../css/CartPage.css";
import { useNavigate } from "react-router-dom";
import {
  Cart,
  CartItem,
  CartItemRequest,
  CartRequest,
} from "../interfaces/Cart";
import Customer from "../interfaces/Customer";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";

const CartPage: React.FC = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [selectedCartItemsLength, setSelectedCartItemsLength] =
    useState<number>(cart?.cartItems.length || 0);
  const authToken = localStorage.getItem("authToken");
  const navigate = useNavigate();
  const apiBaseUrl = "http://localhost:8080";

  const total = cart?.cartItems.reduce(
    (acc, item) =>
      acc + item.productDetails.productPrice * (item.orderQuantity || 1),
    0
  );

  const calculateSubtotal = () => {
    return cart?.cartItems
      .filter((item) => item.isChecked)
      .reduce(
        (total, item) =>
          total + item.productDetails.productPrice * (item.orderQuantity || 1),
        0
      )
      .toFixed(2);
  };

  const updateQuantity = (cartItemId: number | null, delta: number) => {
    let cartItemsRequest: CartItemRequest[] = [];
    cart?.cartItems.forEach((cartItem) => {
      if (cartItem.cartItemId == cartItemId) {
        if ((cartItem.orderQuantity || 1) + delta == 0) {
          console.log("Minimum order quantity is 1");
          return;
        } else if (
          (cartItem.orderQuantity || 1) + delta <=
          cartItem.productDetails.productQuantity
        ) {
          cartItemsRequest.push({
            cartItemId: cartItem.cartItemId,
            customerId: customer?.customerId || null,
            productId: cartItem.productDetails.productId,
            quantity: (cartItem.orderQuantity || 1) + delta,
          });
        } else {
          console.log("Maximum order quantity reached!");
        }
      }
    });
    if (cartItemsRequest.length > 0) {
      const cartObject: CartRequest = {
        customerId: customer?.customerId || 0,
        cartItems: cartItemsRequest,
      };

      axios
        .put(apiBaseUrl + "/ecs-order/api/cart", cartObject, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          if (response.status == 200) {
            console.log("Successfully updated!!");
            setCart((prevCart) => {
              if (!prevCart) return null;
              const updatedCartItems = prevCart.cartItems.map((item) =>
                item.cartItemId === cartItemId
                  ? {
                      ...item,
                      orderQuantity: Math.max(
                        1,
                        (item.orderQuantity || 1) + delta
                      ),
                    }
                  : item
              );
              return { ...prevCart, cartItems: updatedCartItems };
            });
          }
        })
        .catch((error) => {
          console.log("Failed to update!");
        });
    }
  };

  const fetchCustomerAndCart = async () => {
    try {
      if (authToken) {
        const decodedToken = jwtDecode(authToken);
        console.log(decodedToken);
        const email = decodedToken.sub;
        const currentTime = Date.now() / 1000;
        if ((decodedToken.exp ? decodedToken.exp : 0) >= currentTime) {
          try {
            const customerResponse = await axios.get(
              `http://localhost:8080/ecs-customer/api/customer/getByEmail/${email}`,
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
            console.log("Server res: ", cartResponse.data);
            cartResponse.data.cartItems.forEach((cartItem: CartItem) => {
              cartItem.isChecked = true;
            });
            setCart(cartResponse.data);
          } catch (error) {
            console.error("Error: ", error);
          }
        } else {
          console.log("Session Expired!");
          navigate("/signIn");
        }
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  const toggleCartItemSelection = (cartItemId: number) => {
    setCart((prevCart) => {
      if (!prevCart) return null;

      const updatedCartItems = prevCart?.cartItems.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, isChecked: !item.isChecked }
          : item
      );

      return { ...prevCart, cartItems: updatedCartItems };
    });
  };

  const getSelectedCartItems = (): CartItem[] => {
    if (cart) {
      return cart?.cartItems.filter((cartItem) => cartItem.isChecked == true);
    }
    return [];
  };

  const deleteCartItem = (cartItemId: number | null) => {
    if (authToken) {
      const decodedToken = jwtDecode(authToken);
      console.log(decodedToken);
      const email = decodedToken.sub;
      const currentTime = Date.now() / 1000;
      if ((decodedToken.exp ? decodedToken.exp : 0) >= currentTime) {
        axios
          .delete("http://localhost:8080/ecs-order/api/cart/" + cartItemId, {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          })
          .then((response) => {
            console.log("Response : ", response);
            if (
              response.status == 200 &&
              response.data == "CartItem deleted successfully!"
            ) {
              setCart((prevCart) => {
                if (!prevCart) return null;

                const updatedCartItems = prevCart.cartItems.filter(
                  (cartItem) => cartItem.cartItemId != cartItemId
                );

                return { ...prevCart, cartItems: updatedCartItems };
              });
            }
          })
          .catch((error) => {
            console.log("Error: ", error);
          });
      } else {
        console.log("Session Expired!");
        navigate("/signIn");
      }
    } else {
      console.log("User not logged!");
      navigate("/signIn");
    }
  };

  const proceedToCheckout = () => {
    if (selectedCartItemsLength > 0) {
      localStorage.setItem(
        "itemsForCheckout",
        JSON.stringify(getSelectedCartItems())
      );
      let subTotal = calculateSubtotal();
      localStorage.setItem("subTotal", subTotal ? subTotal : "0");
      console.log("Navigated to Checkout Page!");
      navigate("/checkout");
    } else {
      alert("Select at least one item to proceed!");
    }
  };

  useEffect(() => {
    setSelectedCartItemsLength(getSelectedCartItems().length);
    console.log(selectedCartItemsLength);
  }, [cart]);

  useEffect(() => {
    fetchCustomerAndCart();
  }, []);

  return (
    <>
      <Header></Header>
      <div className="cart-components">
        <div className="cart-page col-lg-10">
          <h1>Shopping Cart</h1>
          <hr />
          <div className="cart-items">
            {cart?.cartItems.length == 0 ? (
              <h6>No cart Items found!</h6>
            ) : (
              cart?.cartItems.map((item) => (
                <div key={item.cartItemId} className="cart-item">
                  <div className="checkbox-container">
                    <input
                      type="checkbox"
                      name="cart-item"
                      id="custom-checkbox"
                      key={item.cartItemId}
                      checked={item.isChecked}
                      onChange={() =>
                        toggleCartItemSelection(item.cartItemId || -1)
                      }
                    ></input>
                  </div>
                  <img
                    src={
                      item.productDetails.productImage
                        ? "/src/assets/images/product-images/" +
                          item.productDetails.productImage
                        : ""
                    }
                    alt={item.productDetails.productName}
                    className="item-image"
                  />
                  <div className="item-details">
                    <h2>{item.productDetails.productName}</h2>
                    <p className="item-description">
                      {item.productDetails.productDescription}
                    </p>
                    <p className="delivery">
                      FREE delivery: <strong>"Jan 13 - Feb 4"</strong>
                    </p>
                    {/* {item.isGift && <p className="gift">🎁 This is a gift</p>} */}
                    <div className="item-actions">
                      <div className="quantity-controls">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, -1)}
                        >
                          -
                        </button>
                        <span>{item.orderQuantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="delete-button"
                        onClick={() => deleteCartItem(item.cartItemId)}
                      >
                        <FontAwesomeIcon icon={faTrashCan}></FontAwesomeIcon>
                      </button>
                      {/* <button className="save-for-later-button">
                        Save for later
                      </button> */}
                    </div>
                  </div>
                  <div className="item-price">
                    {item.productDetails.productPrice && (
                      <p className="discount">
                        <span>Discount</span> <br />
                        <span className="original-price">last-price</span>
                      </p>
                    )}
                    <p className="final-price">
                      ${item.productDetails.productPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="cart-summary col-lg-2">
          <h5>
            Subtotal ({selectedCartItemsLength} items): ${calculateSubtotal()}
          </h5>
          <button className="checkout-button" onClick={proceedToCheckout}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </>
  );
};

export default CartPage;
