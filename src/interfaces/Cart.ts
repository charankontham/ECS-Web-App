import Customer from "./Customer";
import { Product } from "./Product";

export interface Cart {
  customer: Customer;
  cartItems: CartItem[];
}

export interface CartRequest {
  customerId: number;
  cartItems: CartItemRequest[];
}

export interface CartItem {
  cartItemId: number | null;
  productDetails: Product;
  orderQuantity: number;
  isChecked?: boolean;
}

export interface CartItemRequest {
  cartItemId: number | null;
  customerId: number | null;
  productId: number | null;
  quantity: number;
}
