import type React from "react";
import { Box, Paper, Typography } from "@mui/material";
import ProductCategory from "@interfaces/ProductCategory";

interface CategoriesSectionProps {
  categories: ProductCategory[];
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  categories,
}) => {
  return (
    <Box sx={{ my: 5 }}>
      <Typography
        variant="h6"
        sx={{ mb: 2.5, fontWeight: 600, fontSize: "16px" }}
      >
        Categories & Sub-Categories
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 2,
        }}
      >
        {categories.map((category) => (
          <Paper
            key={category.categoryId}
            elevation={1}
            sx={{
              p: 2.5,
              borderRadius: "8px",
              backgroundColor: "#f8f9fa",
              border: "1px solid #e9ecef",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "#e3f2fd",
                borderColor: "#1976d2",
                boxShadow: "0 4px 12px rgba(25,118,210,0.1)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "15px",
                color: "#333",
                mb: 0.5,
              }}
            >
              {category.categoryName}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#999",
                fontSize: "13px",
              }}
            >
              {10} products available
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default CategoriesSection;
