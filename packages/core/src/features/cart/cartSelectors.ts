import { cartAdapter, CartItemId } from './cartSlice';
import { CoreState } from '../../reducers';

const { selectById } = cartAdapter.getSelectors(
  (state: CoreState) => state.cart,
);

export const selectCartItem = (state: CoreState, id: CartItemId) =>
  selectById(state, id);

export const selectCart = (state: any) =>
  cartAdapter.getSelectors().selectAll(state.cart);
