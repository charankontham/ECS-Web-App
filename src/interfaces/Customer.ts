interface Customer {
  customerId: number | null;
  customerName?: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}
export default Customer;
