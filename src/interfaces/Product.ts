import ProductBrand from "./ProductBrand"
import ProductCategory from "./ProductCategory"

export interface Product{
    productId: number | null,
    productName: string,
    brand: ProductBrand,
    productCategory: ProductCategory,
    productDescription: string | null,
    productPrice: number,
    productQuantity: number,
    productImage: string,
    productColor: string | null,
    productWeight: number | null,
    productDimensions: string | null,
    productCondition: string | null;
}

export interface ProductRequest {
    productId: number | null;        
    productCategoryId: number | null;
    productBrandId: number | null; 
    productName: string;
    productDescription: string;
    productPrice: number | null;   
    productQuantity: number | null;
    productImage: string;
    productColor: string;
    productWeight: number | null;  
    productDimensions: string;
    productCondition: string;
  }