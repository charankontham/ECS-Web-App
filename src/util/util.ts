export function dummy() {
  console.log("hello");
}

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
