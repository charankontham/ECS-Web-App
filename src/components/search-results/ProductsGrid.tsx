"use client";

import type React from "react";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Rating,
  Chip,
  Divider,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useNavigate } from "react-router-dom";
import { Product } from "@interfaces/Product";

interface ProductsGridProps {
  products: Product[];
  loading: boolean;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({ products, loading }) => {
  const navigate = useNavigate();
  const apiBaseUrl = "http://localhost:8080/";

  if (loading) return null;

  function getImageUrl(imageId: string): string {
    return imageId != null && imageId.trim() !== ""
      ? apiBaseUrl +
          `ecs-inventory-admin/api/public/images/view/getImageById/` +
          imageId
      : "/assets/images/image-placeholder.jpg";
  }

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ mb: 2.5, fontWeight: 600, fontSize: "16px" }}
      >
        Results:
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {products.map((product, index) => (
          <Box key={product.productId}>
            <Card
              sx={{
                display: "flex",
                borderRadius: "8px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                },
              }}
            >
              {/* Product Image Section */}
              <CardMedia
                component="img"
                sx={{
                  width: "240px",
                  height: "240px",
                  objectFit: "cover",
                  flexShrink: 0,
                  cursor: "pointer",
                }}
                image={getImageUrl(product.productImage)}
                alt={product.productName}
                onClick={() => navigate(`/product/${product.productId}`)}
              />

              {/* Product Info Section */}
              <CardContent
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  p: 2.5,
                }}
              >
                {/* Brand & Title */}
                <Box>
                  <Chip
                    label={product.brand.brandName}
                    size="small"
                    variant="outlined"
                    sx={{
                      mb: 1,
                      height: "24px",
                      fontSize: "12px",
                      borderColor: "#1976d2",
                      color: "#1976d2",
                      fontWeight: 600,
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      fontSize: "16px",
                      color: "#333",
                      lineHeight: 1.4,
                      cursor: "pointer",
                      "&:hover": {
                        color: "#1976d2",
                      },
                    }}
                    onClick={() => navigate(`/product/${product.productId}`)}
                  >
                    {product.productName}
                  </Typography>

                  {/* Category */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#666",
                      fontSize: "13px",
                      mb: 1.5,
                    }}
                  >
                    Category: {product.productSubCategory.subCategoryName}
                  </Typography>
                </Box>

                {/* {product.specs && product.specs.length > 0 && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#999",
                        fontSize: "12px",
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      Key Specs:
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {product.specs.slice(0, 3).map((spec, i) => (
                        <Typography
                          key={i}
                          variant="caption"
                          sx={{
                            backgroundColor: "#f5f5f5",
                            px: 1,
                            py: 0.5,
                            borderRadius: "3px",
                            fontSize: "11px",
                            color: "#555",
                          }}
                        >
                          {spec}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )} */}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 1.5,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        color: "#d32f2f",
                        fontWeight: 700,
                        fontSize: "20px",
                      }}
                    >
                      ${product.productPrice.toFixed(2)}
                    </Typography>
                    {product.productPrice && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#999",
                          textDecoration: "line-through",
                          fontSize: "12px",
                        }}
                      >
                        ${product.productPrice.toFixed(2)}
                      </Typography>
                    )}
                    {/* {product.discount && (
                      <Chip
                        label={`${product.discount}% OFF`}
                        size="small"
                        sx={{
                          ml: 1,
                          backgroundColor: "#ff6f00",
                          color: "white",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      />
                    )} */}
                  </Box>

                  <Chip
                    label={product.productCondition}
                    size="small"
                    sx={{
                      backgroundColor:
                        product.productCondition === "New"
                          ? "#4caf50"
                          : "#ff9800",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: 600,
                      height: "26px",
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 1.5,
                    pb: 1.5,
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {/* {product.productRating && (
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Rating
                        value={product.productRating}
                        readOnly
                        size="small"
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#666",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        {product.productRating.toFixed(1)}
                      </Typography>
                      {product.reviewCount && (
                        <Typography
                          variant="caption"
                          sx={{ color: "#999", fontSize: "12px" }}
                        >
                          ({product.reviewCount} reviews)
                        </Typography>
                      )}
                    </Box>
                  )} */}

                  {true && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        ml: "auto",
                      }}
                    >
                      <LocalShippingIcon
                        sx={{ fontSize: "18px", color: "#4caf50" }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#4caf50",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        In {2} days
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Action Button */}
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<ShoppingCartIcon sx={{ fontSize: "18px" }} />}
                  sx={{
                    backgroundColor: "#1976d2",
                    textTransform: "none",
                    fontSize: "14px",
                    fontWeight: 600,
                    padding: "10px",
                    "&:hover": {
                      backgroundColor: "#1565c0",
                    },
                  }}
                >
                  Add to Cart
                </Button>
              </CardContent>
            </Card>

            {/* Divider between products */}
            {index < products.length - 1 && <Divider sx={{ my: 1.5 }} />}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ProductsGrid;
