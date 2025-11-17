import { BaseFilters } from "@src/util/util";
import ProductBrand from "./ProductBrand";
import ProductCategory, { SubCategory } from "./ProductCategory";

export interface Product {
  productId: number | null;
  productName: string;
  brand: ProductBrand;
  productSubCategory: SubCategory;
  productDescription: string | null;
  productPrice: number;
  productQuantity: number;
  productImage: string;
  productColor: string | null;
  productWeight: number | null;
  productDimensions: string | null;
  productCondition: string | null;
  dateAdded: Date;
  dateModified: Date;
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

export interface ProductFilters extends BaseFilters {
  type: "product";
  categoryId?: number | null;
  subCategoryId?: number | null;
  brandId?: number | null;
}
