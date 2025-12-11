interface SearchHistory {
  id?: string;
  customerId: number;
  searchHistory: { [key: string]: any }[];
}

export interface UserSearchDoc {
  id?: string;
  customerId: number;
  searchQuery: string;
  timestamp?: Date;
  expireAt?: Date;
  metaData?: { [key: string]: any };
}

export interface TrendingSearch {
  searchQuery?: string;
  frequency: number;
  uniqueUsersCount: number;
  lastSearchedAt: Date;
  hoursSinceLastSearch: number;
  recencyBoost: number;
  finalScore: number;
}

export default SearchHistory;
