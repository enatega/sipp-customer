import type { RefObject, ReactNode } from "react";
import type { StyleProp, TextInput, TextInputProps, ViewStyle } from "react-native";
import type { ProfileAddress } from "../../api/profileService";

// Generic types for search recommendations and recent searches
export type GenericSearchRecommendation = {
  id: string;
  name: string;
  imageUrl: string;
};

export type GenericRecentSearchItem = {
  id: string;
  term: string;
  normalizedTerm: string;
  createdAt: string;
  updatedAt: string;
};

// Generic address sheet configuration - flexible to work with different apps
export type GenericSearchAddressSheetConfig = {
  addresses: ProfileAddress[];
  bottomOffset?: number;
  isLoading?: boolean;
  isVisible: boolean;
  onAddAddress: () => void;
  onClose: () => void;
  onSelectAddress: (address: ProfileAddress) => void;
  onUseCurrentLocation: () => void;
  selectingAddressId?: string | null | undefined;
  selectedAddressId?: string | null | undefined;
  onOpen: () => void;
};

// Generic theme colors (subset needed for search)
export type GenericSearchColors = {
  background: string;
  border?: string;
  mutedText: string;
  surface?: string;
  text: string;
  primary?: string;
  [key: string]: string | undefined; // Allow additional color properties
};

// Main SearchMainContainer props
export type GenericSearchMainContainerProps = {
  colors: GenericSearchColors;
  inputRef: RefObject<TextInput | null>;
  searchQuery: string;
  recommendations: GenericSearchRecommendation[];
  recentSearches: GenericRecentSearchItem[];
  selectedAddressLabel?: string | null;
  isLoadingRecommendations: boolean;
  deletingRecentSearchId: string | null;
  isDeletingRecentSearch: boolean;
  isClearingRecentSearches: boolean;
  showIdleState: boolean;
  showRecentSearches: boolean;
  handleChangeText: (text: string) => void;
  handleFocus: () => void;
  handleBlur: () => void;
  handleClear: () => void;
  dismissKeyboard: () => void;
  handleSubmitEditing: () => void;
  handleSuggestionPress: (term: string) => void;
  handleRecentSearchPress: (term: string) => void;
  onDeleteRecentSearch: (id: string) => void;
  onClearRecentSearches: () => void;
  addressSheet: GenericSearchAddressSheetConfig;
  children?: ReactNode;
  translationNamespace?: string;
};

export type EmptySearchProps = {
  title?: string;
  subtitle?: string;
  showIcon?: boolean;
};

export type SearchInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onFocus?: TextInputProps["onFocus"];
  onBlur?: TextInputProps["onBlur"];
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
  autoFocus?: boolean;
  density?: 'compact' | 'regular';
  editable?: boolean;
  surfaceElevation?: 'flat' | 'subtle' | 'raised';
  style?: StyleProp<ViewStyle>;
};

export type SearchFilters = {
  sortBy: 'best_match' | 'top_rated' | 'nearest';
  ratings: number | null;
  availability: 'standard' | 'emergency' | null;
};

export type RecentSearchesProps = {
  items: GenericRecentSearchItem[];
  onItemPress: (term: string) => void;
  onDeletePress: (id: string) => void;
  onDeleteAllPress: () => void;
  deletingRecentSearchId: string | null;
  isDeletingRecentSearch: boolean;
  isClearingRecentSearches: boolean;
};

export type RecentSearchProps = {
  search: string;
  onDeletePress: () => void;
  onItemPress: () => void;
  isDeleting?: boolean;
  isDeleteDisabled?: boolean;
};

export type SearchChipProps = {
  label: string;
  onPress: (label: string) => void;
};

export type SearchSuggestionsProps = {
  recommendations: GenericSearchRecommendation[];
  onSuggestionPress: (term: string) => void;
};
