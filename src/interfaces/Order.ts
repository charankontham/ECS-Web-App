import Address from "./Address";
import Customer from "./Customer";
import { Product } from "./Product";

export interface Order {
  orderId: number;
  customer: Customer;
  shippingAddress: Address;
  orderItems: Product[];
  itemsSubTotal: number;
  shippingFee: number;
  totalTax: number;
  totalOrderValue: number;
  orderDate: Date;
  deliveryDate: Date;
  shippingStatus: string;
  paymentType: string;
  paymentStatus: string;
}

export interface OrderRequest {
  orderId: number | null;
  customerId: number | null;
  addressId: number | null;
  paymentType: string;
  paymentStatus: string;
  shippingFee: number;
  orderDate: Date;
  deliveryDate: Date;
  shippingStatus: string;
}

export interface OrderItem {
  orderItemId: number;
  orderId: number;
  productId: number;
  quantity: number;
  productPrice: number;
}
