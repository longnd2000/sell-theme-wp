import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface ThemeUIState {
  searchQuery: string;
  selectedCategory: string;
  cart: CartItem[];
  currentDashboardTab: string;
}

const initialState: ThemeUIState = {
  searchQuery: '',
  selectedCategory: 'All',
  cart: [],
  currentDashboardTab: 'themes',
};

export const themeSlice = createSlice({
  name: 'themeUI',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      if (!state.cart.find(item => item.id === action.payload.id)) {
        state.cart.push(action.payload);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter(item => item.id !== action.payload);
    },
    clearCart: (state) => {
      state.cart = [];
    },
    setDashboardTab: (state, action: PayloadAction<string>) => {
      state.currentDashboardTab = action.payload;
    },
  },
});

export const {
  setSearchQuery,
  setSelectedCategory,
  addToCart,
  removeFromCart,
  clearCart,
  setDashboardTab,
} = themeSlice.actions;

export default themeSlice.reducer;
