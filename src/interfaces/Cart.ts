import Customer from "./Customer";
import {Product} from "./Product";

export interface Cart{
    customer : Customer;
    cartItems : CartItem[];
}

export interface CartRequest{
    customerId: number;
    cartItems: CartItemRequest[];
}

interface CartItem {
    cartItemId: number | null;
    productDetails: Product;
}

interface CartItemRequest{
    cartItemId: number | null;
    customerId: number;
    productId: number;
    quantity: number;
}