import { cartAdapter } from './cartSlice';
import type { CoreState } from '../../reducers';

export const {
  selectById: selectCartItem,
  selectIds: selectCartItems,
  selectAll: selectCart,
  selectTotal: selectCartCount,
} = cartAdapter.getSelectors((state: CoreState) => state.cart);
