// Order data types for frontend integration

export interface OrderData {
  name: string;
  cardLink: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  currency: string;
  email: string;
  discountCode?: string; // Optional discount code
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    cardLink: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    currency: string;
    email: string;
    amount: number;
    transactionId: string;
    reference: string;
    status: 'pending' | 'completed' | 'failed';
    discount?: string;
    createdAt: string;
  };
  paymentUrl?: string; // Only present for payment orders
  reference?: string; // Only present for payment orders
}

export interface DiscountValidationResponse {
  success: boolean;
  valid: boolean;
  message: string;
}

export interface OrderStatusResponse {
  success: boolean;
  data: {
    status: 'pending' | 'completed' | 'failed';
    order: {
      _id: string;
      name: string;
      cardLink: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      country: string;
      currency: string;
      email: string;
      amount: number;
      transactionId: string;
      reference: string;
      status: 'pending' | 'completed' | 'failed';
      discount?: string;
      createdAt: string;
    };
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
}

// Union type for all possible API responses
export type ApiResponse = OrderResponse | DiscountValidationResponse | OrderStatusResponse | ApiErrorResponse;

