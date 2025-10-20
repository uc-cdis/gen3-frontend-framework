import { CartItem } from '@gen3/core';

export const itemsInCart = (cart: CartItem[], newId: string): boolean =>
  cart.map((f) => f.id).some((id) => id === newId);
