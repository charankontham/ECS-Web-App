"use client";

import type React from "react";
import { SyntheticEvent, useEffect, useState } from "react";
import {
  Box,
  Paper,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  Typography,
  Select,
  MenuItem,
  FormControl,
  TextField,
  Autocomplete,
  Collapse,
  IconButton,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProductBrand from "@interfaces/ProductBrand";
import ProductCategory, { SubCategory } from "@interfaces/ProductCategory";

interface FiltersProps {
  filters: {
    priceRange: [number, number];
    brands: number[];
    categories: number[];
    subCategories: number[];
    condition: string[];
    colors: string[];
    minRating: number;
    discount: number;
    sortBy: "relevance" | "lowToHigh" | "highToLow" | "rating";
  };
  onFilterChange: (filters: FiltersProps["filters"]) => void;
}

const CONDITIONS = ["New", "Like New", "Refurbished", "Used"];
const COLORS = ["Red", "Blue", "Black", "White", "Gray", "Green", "Silver"];

const FiltersSidebar: React.FC<FiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const [brandSearchOpen, setBrandSearchOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [selectedBrandsTemp, setSelectedBrandsTemp] = useState<number[]>(
    filters.brands
  );
  const [brands, setBrands] = useState<ProductBrand[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const navigate = useNavigate();
  const apiBaseUrl = "http://localhost:8080";

  const handlePriceChange = (
    event: Event | SyntheticEvent,
    newValue: number | number[]
  ) => {
    const [min, max] = newValue as [number, number];
    onFilterChange({ ...filters, priceRange: [min, max] });
  };

  const handleApplyBrands = () => {
    onFilterChange({ ...filters, brands: selectedBrandsTemp });
    setBrandSearchOpen(false);
  };

  const handleBrandChange = (brandId: number) => {
    setSelectedBrandsTemp((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId]
    );
  };

  const toggleCategoryExpand = (categoryId: number) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCategoryChange = (categoryId: number) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((id) => id !== categoryId)
      : [...filters.categories, categoryId];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const handleSubcategoryChange = (subcategoryId: number) => {
    const newCategories = filters.subCategories.includes(subcategoryId)
      ? filters.subCategories.filter((id) => id !== subcategoryId)
      : [...filters.subCategories, subcategoryId];
    onFilterChange({ ...filters, subCategories: newCategories });
  };

  const handleConditionChange = (condition: string) => {
    const newCondition = filters.condition.includes(condition)
      ? filters.condition.filter((c) => c !== condition)
      : [...filters.condition, condition];
    onFilterChange({ ...filters, condition: newCondition });
  };

  const handleColorChange = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    onFilterChange({ ...filters, colors: newColors });
  };

  const handleRatingChange = (event: Event, newValue: number | number[]) => {
    onFilterChange({ ...filters, minRating: newValue as number });
  };

  const handleDiscountChange = (event: Event, newValue: number | number[]) => {
    onFilterChange({ ...filters, discount: newValue as number });
  };

  const handleSortChange = (event: any) => {
    onFilterChange({ ...filters, sortBy: event.target.value });
  };

  const handleResetFilters = () => {
    onFilterChange({
      priceRange: [0, 5000],
      brands: [],
      categories: [],
      subCategories: [],
      condition: [],
      colors: [],
      minRating: 0,
      discount: 0,
      sortBy: "relevance",
    });
    setSelectedBrandsTemp([]);
    setExpandedCategories([]);
  };

  const loadFilterOptions = async () => {
    try {
      const brandsResponse = await axios.get(
        `${apiBaseUrl}/ecs-product/api/productBrand/`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const subCategoriesResponse = await axios.get(
        `${apiBaseUrl}/ecs-product/api/subCategory/getEnrichedSubCategories`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      // const categoriesResponse = await axios.get(
      //   `${apiBaseUrl}/ecs-product/api/productCategory/`,
      //   {
      //     headers: { "Content-Type": "application/json" },
      //   }
      // );
      setBrands(brandsResponse.data);
      setSubCategories(subCategoriesResponse.data);
      // setAllCategories(categoriesResponse.data);
    } catch (error) {}
  };

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    var categoriesSet = new Set<Number>();
    subCategories.forEach((sc) =>
      categoriesSet.add(sc.productCategory.categoryId!)
    );
    categoriesSet.forEach((id) =>
      setCategories((prev) => [
        ...prev,
        subCategories.find((sc) => sc.productCategory.categoryId === id)
          ?.productCategory!,
      ])
    );
  }, [subCategories]);

  return (
    <Paper
      elevation={2}
      sx={{ p: 2.5, position: "sticky", top: 20, borderRadius: "8px" }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          Sort By
        </Typography>
        <FormControl fullWidth size="small">
          <Select value={filters.sortBy} onChange={handleSortChange}>
            <MenuItem value="relevance">Relevance</MenuItem>
            <MenuItem value="lowToHigh">Price: Low to High</MenuItem>
            <MenuItem value="highToLow">Price: High to Low</MenuItem>
            <MenuItem value="rating">Avg Customer Review</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Price Range Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          Price Range
        </Typography>
        <Slider
          min={0}
          max={5000}
          step={1}
          value={filters.priceRange}
          onChange={handlePriceChange}
          valueLabelDisplay="off"
          disableSwap
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 1,
            fontSize: "13px",
            color: "#282828",
          }}
        >
          <span>${filters.priceRange[0]}</span>
          <span>${filters.priceRange[1]}+</span>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Brand Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          Brand
        </Typography>

        {selectedBrandsTemp.length > 0 && (
          <Box sx={{ mb: 1.5, display: "flex", flexWrap: "wrap", gap: 0.8 }}>
            {selectedBrandsTemp.map((brandId) => {
              const brand = brands.find((b) => b.brandId === brandId);
              return (
                <Chip
                  key={brandId}
                  label={brand?.brandName}
                  onDelete={() => handleBrandChange(brandId)}
                  size="small"
                  sx={{ backgroundColor: "#e3f2fd", color: "#1976d2" }}
                />
              );
            })}
          </Box>
        )}

        <Collapse>
          <Box
            sx={{
              mb: 1.5,
              border: "1px solid #ddd",
              borderRadius: "4px",
              p: 1.5,
            }}
          >
            <Autocomplete
              multiple
              options={brands}
              getOptionLabel={(option) => option.brandName}
              value={brands.filter((b) =>
                selectedBrandsTemp.includes(b.brandId!)
              )}
              onChange={(event, value) => {
                setSelectedBrandsTemp(value.map((v) => v.brandId!));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search brands..."
                  size="small"
                />
              )}
              noOptionsText="No brands found"
              renderTags={() => null}
              ListboxProps={{
                style: { maxHeight: "200px" },
              }}
            />
          </Box>
          <Button
            fullWidth
            variant="contained"
            onClick={handleApplyBrands}
            sx={{
              backgroundColor: "#1976d2",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#1565c0",
              },
            }}
          >
            Apply Brands
          </Button>
        </Collapse>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Categories Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          Category
        </Typography>
        {categories.map((category: ProductCategory) => (
          <Box key={category.categoryId}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => toggleCategoryExpand(category.categoryId!)}
                sx={{ p: 0.5, mr: 0.5 }}
              >
                {expandedCategories.includes(category.categoryId!) ? (
                  <ExpandLessIcon />
                ) : (
                  <ExpandMoreIcon />
                )}
              </IconButton>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={filters.categories.includes(category.categoryId!)}
                    onChange={() => handleCategoryChange(category.categoryId!)}
                  />
                }
                label={category.categoryName}
                sx={{ fontSize: "14px", flex: 1, m: 0 }}
              />
            </Box>

            {/* Subcategories */}
            <Collapse in={expandedCategories.includes(category.categoryId!)}>
              <Box sx={{ pl: 4, mb: 1 }}>
                {subCategories.map(
                  (subcategory) =>
                    subcategory.productCategory.categoryId ==
                      category.categoryId && (
                      <FormControlLabel
                        key={subcategory.subCategoryId}
                        control={
                          <Checkbox
                            size="small"
                            checked={filters.subCategories.includes(
                              subcategory.subCategoryId!
                            )}
                            onChange={() =>
                              handleSubcategoryChange(
                                subcategory.subCategoryId!
                              )
                            }
                          />
                        }
                        label={subcategory.subCategoryName}
                        sx={{ fontSize: "13px", display: "block", mb: 0.5 }}
                      />
                    )
                )}
              </Box>
            </Collapse>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Item Condition Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          Item Condition
        </Typography>
        <FormGroup>
          {CONDITIONS.map((condition) => (
            <FormControlLabel
              key={condition}
              control={
                <Checkbox
                  size="small"
                  checked={filters.condition.includes(condition)}
                  onChange={() => handleConditionChange(condition)}
                />
              }
              label={condition}
              sx={{ fontSize: "14px" }}
            />
          ))}
        </FormGroup>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Color Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          Color
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {COLORS.map((color) => (
            <Box
              key={color}
              onClick={() => handleColorChange(color)}
              sx={{
                width: "28px",
                height: "28px",
                borderRadius: "4px",
                border: filters.colors.includes(color)
                  ? "2px solid #1976d2"
                  : "1px solid #ddd",
                backgroundColor: color.toLowerCase(),
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                },
              }}
              title={color}
            />
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Rating Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          Min. Rating: {filters.minRating} ★
        </Typography>
        <Slider
          min={0}
          max={5}
          step={0.5}
          value={filters.minRating}
          onChange={handleRatingChange}
          marks={[
            { value: 0, label: "0" },
            { value: 5, label: "5" },
          ]}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Discount Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          Min. Discount: {filters.discount}%
        </Typography>
        <Slider
          min={0}
          max={100}
          step={5}
          value={filters.discount}
          onChange={handleDiscountChange}
          marks={[
            { value: 0, label: "0%" },
            { value: 100, label: "100%" },
          ]}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Reset Button */}
      <Button
        fullWidth
        variant="outlined"
        onClick={handleResetFilters}
        sx={{
          borderColor: "#ddd",
          color: "#666",
          textTransform: "none",
          fontWeight: 500,
          "&:hover": {
            backgroundColor: "#f5f5f5",
            borderColor: "#999",
          },
        }}
      >
        Reset Filters
      </Button>
    </Paper>
  );
};

export default FiltersSidebar;
