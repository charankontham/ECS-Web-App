import Address from "./Address";
import Customer from "./Customer";
import { Product } from "./Product";

export interface Order {
  orderId: number | null;
  customer: Customer | null;
  shippingAddress: Address | null;
  orderItems: Product[];
  itemsSubTotal: number;
  totalTax: number;
  totalOrderValue: number;
  orderDate: Date;
  deliveryDate: Date;
  shippingStatus: string;
  paymentType: string;
  paymentStatus: string;
}

// export interface OrderRequest {
//   orderDetails: Order;
//   orderItems: OrderItem[];
// }

interface OrderItem {
  orderItemId: number | null;
  orderId: number | null;
  productId: number | null;
  quantity: number | null;
  productPrice: number | null;
}
