export interface ProductReview {
  reviewId?: number;
  productId?: number;
  customerId?: number;
  customerName: string;
  productRating?: number;
  reviewHeadline?: string;
  productReview?: string;
  reviewDate?: Date;
}
