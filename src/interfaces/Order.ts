import Address from "./Address";
import Customer from "./Customer";
import { DeliveryAgent, DeliveryHub } from "./Logistics";
import { Product } from "./Product";

export interface Order {
  orderId: number;
  customer: Customer;
  shippingAddress: Address;
  orderItems: OrderItemEnriched[];
  itemsSubTotal: number;
  shippingFee: number;
  totalTax: number;
  totalOrderValue: number;
  orderDate: Date;
  orderStatus: number;
  paymentType: number;
  paymentStatus: number;
}

export interface OrderRequest {
  customerId: number | null;
  addressId: number | null;
  paymentType: number;
  paymentStatus: number;
  shippingFee: number;
  orderDate?: Date;
}

export interface OrderItem {
  orderItemId: number;
  orderId: number;
  productId: number;
  quantity: number;
  productPrice: number;
}

export interface OrderItemEnriched {
  product: Product;
  orderItemStatus: number;
}

export interface OrderTracking {
  orderTrackingId: number;
  productId: number;
  orderItemId: number;
  deliveryAgentId: number;
  nearestHubId: number;
  orderTrackingStatusId: number;
  estimatedDeliveryDate: Date;
  actualDeliveryDate: Date | null;
  customerAddressId: number;
  customerInstructions: string | null;
  orderTrackingType: number;
}

export interface OrderTrackingEnriched {
  orderTrackingId: number;
  orderItem: OrderItem;
  product: Product;
  deliveryAgent: DeliveryAgent;
  nearestHub: DeliveryHub;
  orderTrackingStatusId: number;
  estimatedDeliveryTime: Date;
  actualDeliveryTime: Date | null;
  customerAddressId: number;
  customerInstructions: string | null;
  orderTrackingType: number;
}
