interface ProductCategory {
  categoryId: number | null;
  categoryName: string;
  categoryImage: string;
}

export interface SubCategory {
  productCategory: ProductCategory;
  subCategoryId: number;
  subCategoryDescription: string;
  subCategoryImage: string;
  subCategoryName: string;
}

export default ProductCategory;
