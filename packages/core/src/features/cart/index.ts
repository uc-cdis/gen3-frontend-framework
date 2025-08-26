import {
  addFilesToCart,
  type CartItem,
  cartReducer,
  removeFilesFromCart,
} from './cartSlice';

import { selectCart } from './cartSelectors';

export {
  selectCart,
  addFilesToCart,
  removeFilesFromCart,
  type CartItem,
  cartReducer,
};

export const cartReducerPath = 'cart';
