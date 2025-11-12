"use client";
import React, { useState, useEffect } from "react";
import {
  TextField,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  CircularProgress,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HistoryIcon from "@mui/icons-material/History";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import "../../css/SearchBar.css";
import axios from "axios";
import Customer from "@interfaces/Customer";
import { jwtDecode } from "jwt-decode";
import SearchHistory, { UserSearchDoc } from "@interfaces/SearchHistory";

const TRENDING_SEARCHES = [
  "Electronics",
  "Smartphones",
  "Laptops",
  "Accessories",
  "Chargers",
];

const RECENT_SEARCHES = ["headphones", "phone case", "charger"];

interface SearchSuggestion {
  itemId: number;
  itemName: string;
  itemType: string;
  itemCategory?: string;
  relevanceScore: number;
}

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const authToken = localStorage.getItem("authToken");
  const [searchHistory, setSearchHistory] = useState<SearchHistory | null>(
    null
  );

  useEffect(() => {
    setIsLoading(true);
    if (searchQuery.trim().length === 0) {
      setSuggestions(getRecentSearches());
      setIsOpen(true);
      setIsLoading(false);
      setError(null);
      return;
    }
    setError(null);

    const fetchSuggestions = async () => {
      try {
        const query = searchQuery.toLowerCase();
        const response = await axios.get(
          `http://localhost:8080/ecs-product/api/search/${encodeURIComponent(
            query
          )}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const productSuggestions: SearchSuggestion[] = response.data;

        const trendingSuggestions: SearchSuggestion[] =
          TRENDING_SEARCHES.filter((trend) =>
            trend.toLowerCase().includes(query)
          )
            .slice(0, 3)
            .map((trend, index) => ({
              itemId: index + 1000,
              itemName: trend,
              itemType: "trending",
              itemCategory: undefined,
              relevanceScore: 0,
            }));

        const allSuggestions = [
          ...productSuggestions,
          ...trendingSuggestions,
          {
            itemId: 0,
            itemName: query,
            itemType: "search",
            itemCategory: "search",
            relevanceScore: 0,
          } as SearchSuggestion,
        ];
        setSuggestions(allSuggestions);
        setIsOpen(allSuggestions.length > 0);
      } catch (err) {
        setError("Failed to fetch suggestions");
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    };
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchCustomerAndSearchHistory();
  }, []);

  const fetchCustomerAndSearchHistory = async () => {
    try {
      if (authToken) {
        const decodedToken = jwtDecode(authToken);
        const email = decodedToken.sub;
        const currentTime = Date.now() / 1000;
        if ((decodedToken.exp ? decodedToken.exp : 0) >= currentTime) {
          // try {
          const customerResponse = await axios.get(
            `http://localhost:8080/ecs-customer/api/customer/getByEmail/${email}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          setCustomer(customerResponse.data);
          const searchHistoryResponse = await axios.get(
            `http://localhost:8080/ecs-customer/api/searchHistory/getSearchHistoryById/${customerResponse.data.customerId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (searchHistoryResponse.status === 200)
            setSearchHistory(searchHistoryResponse.data);
          // } catch (error) {
          //   console.log("Error: ", error);
          // }
        } else {
          console.log("Session Expired!");
        }
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const addSearchHistory = async (query: string) => {
    if (customer) {
      try {
        if (authToken) {
          const decodedToken = jwtDecode(authToken);
          const email = decodedToken.sub;
          const currentTime = Date.now() / 1000;
          if ((decodedToken.exp ? decodedToken.exp : 0) >= currentTime) {
            var userSearchDoc: UserSearchDoc = {
              customerId: customer.customerId!,
              searchQuery: query.trim(),
              timestamp: new Date(),
              expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              metaData: { search_frequency: 1 },
            };

            const searchHistoryResponse = await axios.put(
              `http://localhost:8080/ecs-customer/api/searchHistory/addUserSearch`,
              userSearchDoc,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            if (searchHistoryResponse.status === 200) {
              setSearchHistory(searchHistoryResponse.data);
            } else {
              console.error(
                "Failed to add search history : ",
                searchHistoryResponse.data
              );
            }
          } else {
            console.log("Session Expired!");
          }
        }
      } catch (error) {
        console.error("Error: ", error);
      }
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.itemName);
    setIsOpen(false);
    // TODO: Implement actual search functionality here

    addSearchHistory(suggestion.itemName);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim().length === 0) {
      setSuggestions(getRecentSearches());
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const getRecentSearches = (): SearchSuggestion[] => {
    if (searchHistory == null || searchHistory.searchHistory.length == 0) {
      return [];
    } else {
      return searchHistory!.searchHistory.map((entry, index) => ({
        itemId: index,
        itemName: entry.query,
        itemType: "recent",
        relevanceScore: 0,
      }));
    }
  };

  function getShortenedName(name: string): string {
    return name.split(" ").length > 7
      ? name.split(" ").slice(0, 7).join(" ") + "…"
      : name;
  }

  function toPascalCase(str: string): string {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(/[-_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  }

  return (
    <Box className="search-bar-container">
      <TextField
        fullWidth
        size="small"
        placeholder="Search ECS Shopper"
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        variant="outlined"
        slotProps={{
          input: {
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: "#999", fontSize: "20px" }} />
            ),
          },
        }}
        sx={{
          backgroundColor: "white",
          "& .MuiOutlinedInput-root": {
            backgroundColor: "white",
          },
        }}
      />

      {isOpen && (
        <Paper
          elevation={3}
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "4px",
            zIndex: 1300,
            borderRadius: "4px",
          }}
        >
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                gap: "12px",
              }}
            >
              <CircularProgress size={24} />
              <span style={{ color: "#666", fontSize: "14px" }}>
                Searching...
              </span>
            </Box>
          ) : (
            isOpen && (
              <List sx={{ padding: 0 }}>
                {suggestions.map((suggestion, index) => (
                  <React.Fragment
                    key={suggestion.itemType + "-" + suggestion.itemId}
                  >
                    <ListItemButton
                      onClick={() => handleSuggestionClick(suggestion)}
                      sx={{
                        padding: "0px 0px",
                        cursor: "pointer",
                        transition: "background-color 0.2s ease",
                        borderLeft:
                          suggestion.itemType != "trending" &&
                          suggestion.itemType != "recent"
                            ? "3px solid #1976d2"
                            : suggestion.itemType === "trending"
                            ? "3px solid #ff9800"
                            : "3px solid #9c27b0",
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color:
                            suggestion.itemType != "trending" &&
                            suggestion.itemType != "recent"
                              ? "#1976d2"
                              : suggestion.itemType === "trending"
                              ? "#ff9800"
                              : "#9c27b0",
                        }}
                      >
                        {suggestion.itemType != "trending" &&
                          suggestion.itemType != "recent" && <SearchIcon />}
                        {suggestion.itemType === "recent" && <HistoryIcon />}
                        {suggestion.itemType === "trending" && (
                          <TrendingUpIcon />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={getShortenedName(suggestion.itemName)}
                        secondary={
                          suggestion.itemType === "trending"
                            ? "Trending"
                            : suggestion.itemType === "recent"
                            ? "Recent"
                            : suggestion.itemType.toLowerCase() == "product" ||
                              suggestion.itemType.toLowerCase() == "subcategory"
                            ? suggestion.itemCategory
                            : suggestion.itemType == "search"
                            ? ""
                            : toPascalCase(suggestion.itemType)
                        }
                        className="search-list-item"
                        sx={{
                          padding:
                            suggestion.itemType.toLowerCase() == "search"
                              ? "10px 0px"
                              : "0px 0px",
                        }}
                      />
                    </ListItemButton>
                    {index < suggestions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )
          )}
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar;
