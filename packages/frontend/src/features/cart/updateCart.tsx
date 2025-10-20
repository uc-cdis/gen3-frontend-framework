import { ActionIcon, Button } from '@mantine/core';
import { cleanNotifications, showNotification } from '@mantine/notifications';
import { focusStyles } from '../../utils';
import {
  addItemsToCart,
  CART_LIMIT,
  CartItem,
  CoreDispatch,
  removeItemsFromCart,
  selectCart,
  selectCartItem,
  useCoreDispatch,
  useCoreSelector,
} from '@gen3/core';
import React, { useEffect } from 'react';
import { CartIcon, TrashIcon, UndoIcon } from '../../types/icons';

interface OverLimitNotificationProps {
  readonly numItemsInCart: number;
}
const OverLimitNotification: React.FC<OverLimitNotificationProps> = ({
  numItemsInCart,
}: OverLimitNotificationProps) => (
  <>
    <p>
      The cart is limited to {CART_LIMIT.toLocaleString()} items and currently
      contains {numItemsInCart.toLocaleString()}{' '}
      {numItemsInCart === 1 ? 'item' : 'items'}.
    </p>
    <p>
      Please add fewer items and/or first remove some items from the cart before
      adding more.
    </p>
  </>
);

interface UndoButtonProps {
  readonly action: () => void;
}
const UndoButton: React.FC<UndoButtonProps> = ({ action }: UndoButtonProps) => {
  return (
    <Button
      variant={'white'}
      onClick={action}
      leftSection={<UndoIcon aria-hidden="true" />}
    >
      <span className="underline">Undo</span>
    </Button>
  );
};

interface AddNotificationProps {
  readonly items: CartItem[];
  readonly currentCart: CartItem[];
  dispatch: CoreDispatch;
}
const AddNotification: React.FC<AddNotificationProps> = ({
  items,
  currentCart,
  dispatch,
}: AddNotificationProps) => {
  const itemsToAdd = items?.filter(
    (f) => !currentCart?.map((c) => c.id).includes(f.id),
  );

  const newCart = [...currentCart, ...itemsToAdd];

  const alreadyInCart = items?.filter((f) => {
    return currentCart?.map((c) => {
      return c.id.includes(f.id);
    });
  });

  useEffect(() => {
    if (itemsToAdd.length > 0) {
      dispatch(addItemsToCart(itemsToAdd));
    }
  }, [itemsToAdd, dispatch]);

  if (items.length === 1) {
    if (itemsToAdd.length === 1) {
      return (
        <>
          <p>Added {items[0].file_name} to the cart.</p>
          <UndoButton
            action={() => removeFromCart(itemsToAdd, newCart, dispatch)}
          />
        </>
      );
    } else {
      return (
        <>{items[0].file_name} was already in the cart and was not added.</>
      );
    }
  } else {
    if (alreadyInCart.length === 0) {
      return (
        <>
          <p>
            Added {itemsToAdd.length}{' '}
            {itemsToAdd.length === 1 ? 'file' : 'items'} to the cart.
          </p>
          <UndoButton
            action={() => removeFromCart(itemsToAdd, newCart, dispatch)}
          />
        </>
      );
    } else {
      return (
        <>
          <p>
            Added {itemsToAdd.length}{' '}
            {itemsToAdd.length === 1 ? 'file' : 'items'} to the cart.
          </p>
          <p>
            {alreadyInCart.length}{' '}
            {alreadyInCart.length === 1 ? 'file was' : 'items were'} already in
            the cart and {alreadyInCart.length === 1 ? 'was' : 'were'} not
            added.
          </p>
          {itemsToAdd.length !== 0 && (
            <UndoButton
              action={() => removeFromCart(itemsToAdd, newCart, dispatch)}
            />
          )}
        </>
      );
    }
  }
};

interface RemoveNotificationProps {
  items: readonly CartItem[];
  readonly currentCart: CartItem[];
  dispatch: CoreDispatch;
}
const RemoveNotification: React.FC<RemoveNotificationProps> = ({
  items,
  currentCart,
  dispatch,
}: RemoveNotificationProps) => {
  const itemsToRemove = items?.filter((f) =>
    currentCart?.map((CartItem) => CartItem.id).includes(f.id),
  );

  const newCart = items?.filter((f) => !itemsToRemove.includes(f));

  if (itemsToRemove.length === 1) {
    return (
      <>
        <p>Removed {itemsToRemove[0].file_name} from the cart.</p>
        <UndoButton
          action={() => addToCart(itemsToRemove, newCart, dispatch)}
        />
      </>
    );
  } else {
    return (
      <>
        <p>Removed {itemsToRemove.length} items from the cart.</p>
        {itemsToRemove.length !== 0 && (
          <UndoButton
            action={() => addToCart(itemsToRemove, newCart, dispatch)}
          />
        )}
      </>
    );
  }
};

export const removeFromCart = (
  items: readonly CartItem[],
  currentCart: CartItem[],
  dispatch: CoreDispatch,
): void => {
  cleanNotifications();
  showNotification({
    message: (
      <RemoveNotification
        items={items}
        currentCart={currentCart}
        dispatch={dispatch}
      />
    ),
    classNames: {
      description: 'flex flex-col content-center text-center',
    },
    closeButtonProps: { 'aria-label': 'Close notification' },
    position: 'top-center',
  });
  const itemsToRemove = items?.map((f) => f.id);
  dispatch(removeItemsFromCart(itemsToRemove));
};

export const showCartOverLimitNotification = (numItemsInCart: number): void => {
  showNotification({
    message: <OverLimitNotification numItemsInCart={numItemsInCart} />,
    classNames: {
      description: 'flex flex-col content-center text-center',
    },
    closeButtonProps: { 'aria-label': 'Close notification' },
    position: 'top-center',
  });
};

export const addToCart = (
  items: CartItem[],
  currentCart: CartItem[],
  dispatch: CoreDispatch,
): void => {
  const newCartSize = items.length + currentCart.length;
  cleanNotifications();

  if (newCartSize > CART_LIMIT) {
    showCartOverLimitNotification(currentCart.length);
  } else {
    showNotification({
      message: (
        <AddNotification
          items={items}
          currentCart={currentCart}
          dispatch={dispatch}
        />
      ),
      classNames: {
        description: 'flex flex-col content-center text-center',
      },
      closeButtonProps: { 'aria-label': 'Close notification' },
      position: 'top-center',
    });
  }
};

interface CartButtonProps {
  readonly items: CartItem[];
  readonly iconOnly?: boolean;
}

export const AddToCartButton: React.FC<CartButtonProps> = ({
  items,
  iconOnly = false,
}: CartButtonProps) => {
  const currentCart = useCoreSelector((state) => selectCart(state));
  const dispatch = useCoreDispatch();

  return iconOnly ? (
    <ActionIcon
      title="Add to cart"
      aria-label="Add to cart"
      className="mx-auto text-primary-content-darkest border-primary-darkest"
      onClick={() => addToCart(items, currentCart, dispatch)}
    >
      <CartIcon />
    </ActionIcon>
  ) : (
    <Button
      data-testid="button-add-to-cart"
      className={`font-medium text-sm text-primary bg-base-max hover:bg-primary-darkest hover:text-primary-contrast-darker ${focusStyles}`}
      onClick={() => addToCart(items, currentCart, dispatch)}
      variant="outline"
    >
      <CartIcon className="mr-2" /> Add to Cart
    </Button>
  );
};

export const RemoveFromCartButton: React.FC<CartButtonProps> = ({
  items,
  iconOnly = false,
}: CartButtonProps) => {
  const currentCart = useCoreSelector((state) => selectCart(state));
  const dispatch = useCoreDispatch();

  return iconOnly ? (
    <ActionIcon
      size={24}
      title="Remove From Cart"
      aria-label="Remove from cart"
      variant="outline"
      onClick={() => removeFromCart(items, currentCart, dispatch)}
      className="ml-4 text-primary border-primary"
    >
      <TrashIcon />
    </ActionIcon>
  ) : (
    <Button
      data-testid="button-remove-from-cart"
      onClick={() => removeFromCart(items, currentCart, dispatch)}
      className={`font-medium text-sm text-base-max primary-darker hover:bg-removeButtonHover ${focusStyles}`}
      variant="outline"
    >
      <CartIcon className="mr-2" />
      Remove From Cart
    </Button>
  );
};

interface SingleItemCartButtonProps {
  readonly item: CartItem;
}

export const SingleItemAddToCartButton: React.FC<SingleItemCartButtonProps> = ({
  item,
}: SingleItemCartButtonProps) => {
  const currentCart = useCoreSelector((state) => selectCart(state));
  const dispatch = useCoreDispatch();
  const inCart = useCoreSelector((state) => selectCartItem(state, item.id));

  return (
    <ActionIcon
      key={item.id}
      title={inCart ? 'Remove From Cart' : 'Add to Cart'}
      aria-label={inCart ? 'Remove from cart' : 'Add to Cart'}
      onClick={() => {
        if (inCart) {
          removeFromCart([item], currentCart, dispatch);
        } else {
          addToCart([item], currentCart, dispatch);
        }
      }}
      className={`mx-auto ${
        inCart ? 'bg-primary text-white' : 'bg-white text-black border-primary'
      }`}
    >
      <CartIcon />
    </ActionIcon>
  );
};
