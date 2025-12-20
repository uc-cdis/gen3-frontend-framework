import React from 'react';
import { Grid } from '@mantine/core';
import {
  CoreState,
  selectCart,
  useCoreSelector,
  useFetchUserDetailsQuery,
} from '@gen3/core';
import FilesTable from './FilesTable';
import CartHeader from './CartHeader';
import AuthorizationTable from './AuthorizationTable';
import HeaderTitle from '../../components/HeaderTitle';
import DownloadInfo from './DownloadInfo';
import { Icon } from '@iconify-icon/react';
import { CartSummaryFunction, EmptyCartSummary } from './types';

interface CartProps {
  cartSummaryFunction?: CartSummaryFunction;
}

const Cart: React.FC = ({
  cartSummaryFunction = () => EmptyCartSummary,
}: CartProps) => {
  const cart = useCoreSelector((state: CoreState) => selectCart(state));

  const summaryData = cartSummaryFunction(cart.map((f) => f?.file_id));

  const { data: userDetails, isFetching: userDetailsFetching } =
    useFetchUserDetailsQuery();

  //  const filesByCanAccess = groupByAccess(cart, userDetails?.data ? userDetails.data : {} as unknown as AuthzMapping);
  // TODO: enable when we have indexed new data
  const filesByCanAccess: any = {};
  const dbGapList = Array.from(
    new Set(
      (filesByCanAccess?.true || [])
        .reduce((acc: any, f: any) => acc.concat(f.acl), [])
        .filter((f: any) => f !== 'open'),
    ),
  );

  return cart.length === 0 ? (
    <Grid justify="center" className="bg-base-lightest flex-grow">
      <Grid.Col span={4} className="my-20 flex flex-col items-center">
        <div className="h-40 w-40 rounded-[50%] bg-emptyIconLighterColor flex justify-center items-center">
          <Icon icon="gen3:cart" size={80} className="text-primary-darkest" />
        </div>
        <p className="uppercase text-primary-darkest text-2xl font-montserrat mt-4">
          Your cart is empty.
        </p>
      </Grid.Col>
    </Grid>
  ) : (
    <>
      <CartHeader
        summaryData={summaryData}
        cart={cart}
        filesByCanAccess={filesByCanAccess}
        dbGapList={dbGapList as string[]}
      />
      <div className="mt-4 mx-4 mb-16">
        <DownloadInfo />
        <div className="flex flex-col xl:flex-row gap-8 mt-4">
          <div className="flex flex-col hidden">
            <HeaderTitle>File counts by authorization level</HeaderTitle>
            <AuthorizationTable
              customDataTestID="table-file-counts-by-authorization-level"
              filesByCanAccess={filesByCanAccess}
              loading={userDetailsFetching}
            />
          </div>
        </div>
        <div className="mt-6">
          <HeaderTitle>Cart Items</HeaderTitle>
          <FilesTable
            customDataTestID="table-cart-items"
            filesByCanAccess={filesByCanAccess}
          />
        </div>
      </div>
    </>
  );
};

export default Cart;
