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
  invoiceId: number;
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
  invoiceId: number;
}

export interface OrderItemEnriched {
  orderItemId: number;
  orderId: number;
  product: Product;
  orderItemStatus: number;
  invoiceId: number;
}

export interface OrderTracking {
  orderTrackingId: string;
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
  orderTrackingId: string;
  orderItem: OrderItem;
  product: Product;
  deliveryAgent: DeliveryAgent;
  nearestHub: DeliveryHub;
  orderTrackingStatusId: number;
  estimatedDeliveryTime: Date;
  actualDeliveryDate: Date | null;
  customerAddressId: number;
  customerInstructions: string | null;
  orderTrackingType: number;
}

export interface OrderReturnRequest {
  OrderReturnId?: number;
  OrderItemId: number;
  ProductQuantity: number;
  CustomerId: number;
  PickupAddressId: number;
  OrderTrackingId?: string;
  ReturnReasonCategoryId: number;
  ReturnReason?: string;
  DateAdded?: Date;
  DateModified?: Date;
  ReturnPaymentSourceId: number;
}

export interface OrderReturn {
  orderReturnId: number;
  orderItemId: number;
  productQuantity: number;
  customerId: number;
  orderTracking?: OrderTracking;
  returnReasonCategoryId: number;
  returnReason?: string;
  dateAdded: Date;
  dateModified: Date;
  returnPaymentSourceId: number;
}
