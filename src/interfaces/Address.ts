interface Address {
  addressId: number | null;
  userId: string | null;
  name: string | null;
  contact: string | null;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export default Address;
