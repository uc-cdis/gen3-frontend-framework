import { EntityState } from '@reduxjs/toolkit';
import {
  addItemsToCart,
  CartItem,
  CartItemId,
  cartReducer,
  removeItemsFromCart,
} from '../cartSlice';

const INITIAL_ITEMS = {
  '23232': { id: '23232', name: 'test', size: 100000 },
  '4445': { id: '4445', name: 'another', size: 1221 },
};

describe('cartSlice Initial State', () => {
  const localState: EntityState<CartItem, CartItemId> = {
    ids: ['23232', '4445'],
    entities: INITIAL_ITEMS,
  };

  test('should return the default state for unknown actions', () => {
    const testState = cartReducer(localState, { type: 'asdf' });
    expect(testState).toEqual({
      entities: INITIAL_ITEMS,
      ids: ['23232', '4445'],
    });
  });
});

describe('cartSlice add items', () => {
  const localState: EntityState<CartItem, CartItemId> = {
    ids: ['23232', '4445'],
    entities: INITIAL_ITEMS,
  };

  test('should add items to cart', () => {
    const testState = cartReducer(
      localState,
      addItemsToCart([
        { id: '1234', name: 'test' },
        { id: '5678', name: 'test2' },
        { id: '9012', name: 'test3' },
      ]),
    );
    expect(testState).toEqual({
      entities: {
        '1234': {
          id: '1234',
          name: 'test',
        },
        '4445': {
          id: '4445',
          name: 'another',
          size: 1221,
        },
        '5678': {
          id: '5678',
          name: 'test2',
        },
        '9012': {
          id: '9012',
          name: 'test3',
        },
        '23232': {
          id: '23232',
          name: 'test',
          size: 100000,
        },
      },
      ids: ['23232', '4445', '1234', '5678', '9012'],
    });
  });
});

describe('cartSlice remove items', () => {
  test('should remove items from cart', () => {
    const localState = {
      entities: {
        '1234': {
          id: '1234',
          name: 'test',
        },
        '4445': {
          id: '4445',
          name: 'another',
          size: 1221,
        },
        '5678': {
          id: '5678',
          name: 'test2',
        },
        '9012': {
          id: '9012',
          name: 'test3',
        },
        '23232': {
          id: '23232',
          name: 'test',
          size: 100000,
        },
      },
      ids: ['23232', '4445', '1234', '5678', '9012'],
    };

    const testState = cartReducer(
      localState,
      removeItemsFromCart(['1234', '23232']),
    );

    const expectedState = {
      entities: {
        '4445': {
          id: '4445',
          name: 'another',
          size: 1221,
        },
        '5678': {
          id: '5678',
          name: 'test2',
        },
        '9012': {
          id: '9012',
          name: 'test3',
        },
      },
      ids: ['4445', '5678', '9012'],
    };

    expect(testState).toEqual(expectedState);
  });
});
