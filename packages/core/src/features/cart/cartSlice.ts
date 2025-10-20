import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

export type CartItemId = string;
export interface CartItem extends Record<string, any> {
  id: CartItemId;
}

export const cartAdapter = createEntityAdapter<CartItem, CartItemId>({
  selectId: (item) => item.id,
});

const initialState = cartAdapter.getInitialState({});

export const cartSlice = createSlice({
  name: 'cart',
  initialState: initialState,
  reducers: {
    addItemsToCart: cartAdapter.addMany,
    removeItemsFromCart: cartAdapter.removeMany,
  },
});

export const cartReducer = cartSlice.reducer;
export const { addItemsToCart, removeItemsFromCart } = cartSlice.actions;
