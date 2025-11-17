import type React from "react";
import { Box, Paper, Typography } from "@mui/material";
import ProductBrand from "@interfaces/ProductBrand";

interface BrandsSectionProps {
  brands: ProductBrand[];
}

const BrandsSection: React.FC<BrandsSectionProps> = ({ brands }) => {
  return (
    <Box sx={{ my: 5 }}>
      <Typography
        variant="h6"
        sx={{ mb: 2.5, fontWeight: 600, fontSize: "16px" }}
      >
        Brands
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {brands.map((brand) => (
          <Paper
            key={brand.brandId}
            elevation={1}
            sx={{
              px: 2.5,
              py: 1.5,
              borderRadius: "8px",
              backgroundColor: "#f8f9fa",
              border: "1px solid #e9ecef",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "#e3f2fd",
                borderColor: "#1976d2",
                boxShadow: "0 4px 12px rgba(25,118,210,0.1)",
              },
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "14px",
                color: "#333",
              }}
            >
              {brand.brandName}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#999",
                fontSize: "12px",
              }}
            >
              {10} products
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default BrandsSection;
