import React, { JSX } from 'react';
import { NavPageLayout, NavPageLayoutProps } from '../../features/Navigation';
import { DataLibrarySelectionProvider } from '../../features/DataLibrary/selection/SelectionContext';
import CheckoutSummary from '../../features/DataLibrary/checkout/CheckoutSummary';
import { DataLibraryActionsConfig } from '../../features/DataLibrary/selection/types';

interface CheckoutSummaryPageProps extends NavPageLayoutProps {
  actions: DataLibraryActionsConfig;
  onBack?: () => void;
}

const CheckoutSummaryPage = ({
  headerProps,
  footerProps,
  actions,
  onBack,
}: CheckoutSummaryPageProps): JSX.Element => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Checkout Summary',
        content: 'Review and export selected files',
        key: 'gen3-checkout-summary-page',
      }}
    >
      <DataLibrarySelectionProvider>
        <CheckoutSummary actions={actions} onBack={onBack} />
      </DataLibrarySelectionProvider>
    </NavPageLayout>
  );
};

export default CheckoutSummaryPage;
