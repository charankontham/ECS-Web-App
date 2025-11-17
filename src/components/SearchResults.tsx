"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Box, Container, Pagination, CircularProgress } from "@mui/material";
import FiltersSidebar from "./search-results/FiltersSidebar";
import ProductsGrid from "./search-results/ProductsGrid";
import RelatedSearches from "./search-results/RelatedSearches";
import BrandsSection from "./search-results/BrandSection";
import CategoriesSection from "./search-results/CategoriesSection";
import Header from "./home-common/Header";
import Footer from "./Footer";
import "../css/SearchResults.css";
import axios from "axios";
import { useParams, useSearchParams } from "react-router-dom";
import ProductBrand from "@interfaces/ProductBrand";
import ProductCategory from "@interfaces/ProductCategory";
import { Product } from "@interfaces/Product";

interface SearchResultsData {
  products: Product[];
  brands: ProductBrand[];
  categories: ProductCategory[];
  totalProducts: number;
}

const DUMMY_RELATED_SEARCHES = [
  "Wireless Headphones",
  "Earbuds with Noise Cancellation",
  "Best Budget Headphones",
  "Gaming Headphones",
  "Bluetooth Speakers",
  "Over-ear Headphones",
];

const DUMMY_BRANDS: ProductBrand[] = [
  { brandId: 1, brandName: "Sony", brandDescription: "" },
  { brandId: 2, brandName: "JBL", brandDescription: "" },
  { brandId: 3, brandName: "Bose", brandDescription: "" },
  { brandId: 4, brandName: "Sennheiser", brandDescription: "" },
];

const DUMMY_CATEGORIES: ProductCategory[] = [
  { categoryId: 1, categoryName: "Electronics", categoryImage: "" },
  { categoryId: 2, categoryName: "Audio Devices", categoryImage: "" },
  { categoryId: 3, categoryName: "Accessories", categoryImage: "" },
];

const SearchResults: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<ProductBrand[]>(DUMMY_BRANDS);
  const [categories, setCategories] =
    useState<ProductCategory[]>(DUMMY_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 10;
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("query");
  const [filters, setFilters] = useState({
    priceRange: [0, 5000] as [number, number],
    brands: [] as number[],
    categories: [] as number[],
    subCategories: [] as number[],
    condition: [] as string[],
    colors: [] as string[],
    minRating: 0,
    discount: 0,
    sortBy: "relevance" as "relevance" | "lowToHigh" | "highToLow" | "rating",
  });

  useEffect(() => {
    fetchSearchResults();
  }, [searchQuery, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Filters : ", filters);
    }, 700);
    return () => clearTimeout(timer);
  }, [filters]);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/ecs-product/api/search/globalSearch?searchQuery=${searchQuery}&currentPage=${
          page - 1
        }&pageSize=${productsPerPage}&sortBy=relevance`,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Search Results Response:", response.data);
      setProducts(response.data.content);
      setTotalPages(Math.ceil(response.data.totalPages / productsPerPage));
    } catch (error) {
      console.error("[v0] Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="search-results-page">
      <Header />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Results header with query info */}
        <Box sx={{ mb: 3 }}>
          <h1 className="search-results-title">
            Search Results for:{" "}
            <span className="search-query">{searchQuery}</span>
          </h1>
          <p className="results-info">
            Showing {productsPerPage} of {productsPerPage * totalPages} results
          </p>
        </Box>
        <Box sx={{ display: "flex", gap: 3 }}>
          <Box
            sx={{
              width: "20%",
              flexShrink: 0,
            }}
          >
            <FiltersSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </Box>
          <Box sx={{ width: "80%", flex: 1 }}>
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "400px",
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <>
                <ProductsGrid products={products} loading={loading} />
                {totalPages > 1 && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", my: 4 }}
                  >
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      size="large"
                      sx={{
                        "& .MuiPaginationItem-root": {
                          borderRadius: "4px",
                          fontSize: "14px",
                        },
                      }}
                    />
                  </Box>
                )}
                {/* <RelatedSearches searches={DUMMY_RELATED_SEARCHES} />
                <BrandsSection brands={brands} />
                <CategoriesSection categories={categories} /> */}
              </>
            )}
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 3 }}>
          <Box
            sx={{
              width: "20%",
              flexShrink: 0,
            }}
          ></Box>
          <Box sx={{ width: "80%", flex: 1 }}>
            <RelatedSearches searches={DUMMY_RELATED_SEARCHES} />
            <BrandsSection brands={brands} />
            <CategoriesSection categories={categories} />
          </Box>
        </Box>
      </Container>
      <Footer />
    </div>
  );
};

export default SearchResults;
