import {
  addItemsToCart,
  type CartItem,
  cartReducer,
  removeItemsFromCart,
} from './cartSlice';

import {
  selectCart,
  selectCartCount,
  selectCartItem,
  selectCartItems,
} from './cartSelectors';

export {
  selectCart,
  addItemsToCart,
  removeItemsFromCart,
  type CartItem,
  cartReducer,
  selectCartCount,
  selectCartItem,
  selectCartItems,
};

export const cartReducerPath = 'cart';
