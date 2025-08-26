import {
  addItemsToCart,
  type CartItem,
  cartReducer,
  removeItemsFromCart,
} from './cartSlice';

import { selectCart, selectCartCount } from './cartSelectors';

export {
  selectCart,
  addItemsToCart,
  removeItemsFromCart,
  type CartItem,
  cartReducer,
  selectCartCount,
};

export const cartReducerPath = 'cart';
