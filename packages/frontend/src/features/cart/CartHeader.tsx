import React, { useState } from 'react';
import { CartFile, CartSummary } from './types';
import { useFetchUserDetailsQuery } from '@gen3/core';
import CartSummaryPanel from './CartSummaryPanel';

interface CartHeaderProps {
  summaryData: CartSummary;
  cart: CartFile[];
}

const CartHeader: React.FC<CartHeaderProps> = ({
  summaryData,
  cart,
}: CartHeaderProps) => {
  const { data: userDetails } = useFetchUserDetailsQuery();
  const [manifestDownloadActive, setManifestDownloadActive] = useState(false);

  return (
    <div
      className="bg-primary text-primary-contrast-darkest flex flex-col-reverse 2xl:flex-row 2xl:items-center gap-4 w-full p-4"
      data-testid="cart-header"
    >
      <div className="flex flex-wrap gap-2">
        <CartSummaryPanel summary={summaryData} />
      </div>
    </div>
  );
};

export default CartHeader;
