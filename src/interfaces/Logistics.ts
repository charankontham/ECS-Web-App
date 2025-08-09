import { OrderTrackingEnriched } from "./Order";

export interface DeliveryAgentDto {
  deliveryAgentId: number | null;
  deliveryAgentName: string;
  contactNumber: string;
  Email: number;
  Password?: number;
  AvailabilityStatus: number;
  Rating: number;
  TotalDeliveries: Date | null;
  ServingArea: number;
  DateAdded?: Date;
  DateModified?: Date;
}

export interface DeliveryAgent {
  deliveryAgentId: number | null;
  deliveryAgentName: string;
  contactNumber: string;
}

export interface DeliveryHub {
  deliveryHubId: number;
  deliveryHubName: string;
}

export interface OrderTrackingObject {
  orderId: number;
  productId: number;
  orderTracking: OrderTrackingEnriched | null;
}
