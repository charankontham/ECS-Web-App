import type React from "react";
import { Box, Paper, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface RelatedSearchesProps {
  searches: string[];
}

const RelatedSearches: React.FC<RelatedSearchesProps> = ({ searches }) => {
  return (
    <Box sx={{ my: 5 }}>
      <Typography
        variant="h6"
        sx={{ mb: 2.5, fontWeight: 600, fontSize: "16px" }}
      >
        Related Searches
      </Typography>

      {/* 2x3 Matrix Layout */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 2,
        }}
      >
        {searches.map((search, index) => (
          <Paper
            key={index}
            elevation={1}
            sx={{
              p: 2.5,
              textAlign: "center",
              borderRadius: "8px",
              backgroundColor: "#f8f9fa",
              border: "1px solid #e9ecef",
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              "&:hover": {
                backgroundColor: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <SearchIcon
              sx={{
                color: "#1976d2",
                fontSize: "24px",
              }}
            />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                fontSize: "14px",
                color: "#333",
              }}
            >
              {search}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default RelatedSearches;
