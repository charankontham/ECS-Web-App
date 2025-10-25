export const paymentMethods = [
  {
    id: 1,
    value: "Credit Card",
  },
  {
    id: 2,
    value: "Debit Card",
  },
  {
    id: 3,
    value: "Net Banking",
  },
  {
    id: 4,
    value: "UPI",
  },
  {
    id: 5,
    value: "Wallets",
  },
  {
    id: 6,
    value: "Paypal",
  },
];

export const paymentStatus = [
  { id: 1, value: "Completed" },
  { id: 2, value: "Pending" },
  { id: 3, value: "Failed" },
  { id: 4, value: "Refunded" },
  { id: 5, value: "Cancelled" },
];

export enum OrderTrackingStatusEnum {
  OrderPlaced = 1,
  ShipmentInTransit = 2,
  Shipped = 3,
  WaitingForDeliveryAgent = 4,
  OutForDelivery = 5,
  Delivered = 6,
  Cancelled = 7,
  ReturnedToDeliveryHub = 8,
}

export enum PaymentMethodEnum {
  CreditCard = 1,
  DebitCard = 2,
  NetBanking = 3,
  UPI = 4,
  Wallets = 5,
  Paypal = 6,
  OriginalPaymentMethod = 7,
}

export const PAYMENT_METHOD_MAP: Readonly<Record<number, string>> = {
  [PaymentMethodEnum.CreditCard]: "Credit Card",
  [PaymentMethodEnum.DebitCard]: "Debit Card",
  [PaymentMethodEnum.NetBanking]: "Net Banking",
  [PaymentMethodEnum.UPI]: "UPI",
  [PaymentMethodEnum.Wallets]: "Wallets",
  [PaymentMethodEnum.Paypal]: "Paypal",
  [PaymentMethodEnum.OriginalPaymentMethod]: "Original Payment Method",
};

export enum ReturnReasonCategoryEnum {
  DamagedProduct = 1,
  WrongItem = 2,
  NotAsDescribed = 3,
  LowProductQuality = 4,
  ChangedMind = 5,
  Other = 6,
}

export const RETURN_REASON_CATEGORY_MAP: Readonly<Record<number, string>> = {
  [ReturnReasonCategoryEnum.DamagedProduct]: "Received damaged product",
  [ReturnReasonCategoryEnum.WrongItem]: "Wrong item delivered",
  [ReturnReasonCategoryEnum.NotAsDescribed]: "Item not as described",
  [ReturnReasonCategoryEnum.LowProductQuality]:
    "Product quality not satisfactory",
  [ReturnReasonCategoryEnum.ChangedMind]: "Changed my mind",
  [ReturnReasonCategoryEnum.Other]: "Other",
};

export const ORDER_RETURN_STATUS_MAP: Readonly<Record<number, string>> = {
  1: "Return Requested",
  2: "Return Accepted",
  3: "Ready For Pickup",
  4: "Waiting For Agent",
  5: "Out For Pickup",
  6: "Refund Issued",
  7: "Returned",
};

export const ORDER_TRACKING_STATUS_MAP: Readonly<Record<number, string>> = {
  [OrderTrackingStatusEnum.OrderPlaced]: "Order Placed",
  [OrderTrackingStatusEnum.ShipmentInTransit]: "In Transit",
  [OrderTrackingStatusEnum.Shipped]: "Shipped",
  [OrderTrackingStatusEnum.WaitingForDeliveryAgent]: "Waiting For Agent",
  [OrderTrackingStatusEnum.OutForDelivery]: "Out For Delivery",
  [OrderTrackingStatusEnum.Delivered]: "Delivered",
  [OrderTrackingStatusEnum.Cancelled]: "Cancelled",
  [OrderTrackingStatusEnum.ReturnedToDeliveryHub]: "Returned",
};
