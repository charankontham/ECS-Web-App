import React from "react";
// import "./OrderPage.css";
import "bootstrap/dist/css/bootstrap.css";

const OrderPage = () => {
    return (
        <div className="order-page">
            <h2>Checkout</h2>
            <form className="checkout-form">
                <label>Billing Address</label>
                <input type="text" placeholder="Enter billing address" />

                <label>Shipping Address</label>
                <input type="text" placeholder="Enter shipping address" />

                <label>Payment Method</label>
                <select>
                    <option>Credit Card</option>
                    <option>PayPal</option>
                </select>

                <button className="btn btn-red">Place Order</button>
            </form>
        </div>
    );
};

export default OrderPage;
