import React, { forwardRef, ReactElement, useState } from 'react';
import {
  Accordion,
  Box,
  Group,
  Loader,
  LoadingOverlay,
  Select,
  Text,
} from '@mantine/core';
import { type PayModel, useGetWorkspacePayModelsQuery } from '@gen3/core';
import { useDeepCompareMemo } from 'use-deep-compare';

interface PayModelMenuItem {
  value: string;
  label: string;
  icon: ReactElement;
  totalUsage: string;
}
import {
  FaUser as ActiveIcon,
  FaExclamationCircle as InactiveIcon,
} from 'react-icons/fa';
import { PaymentNumberToString } from '../utils';
import { WarningCard, ErrorCard } from '../../../components/MessageCards';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { SerializedError } from '@reduxjs/toolkit';

const isNoPayModelError = (error: FetchBaseQueryError | SerializedError) => {
  return (
    'status' in error &&
    error.status === 'PARSING_ERROR' &&
    error.originalStatus === 404
  );
};

const NoPayModel = () => {
  return (
    <Group className="p-2 border-1 border-base-lighter w-full">
      <Text className="pl-4" size="md">
        No pay model set
      </Text>
    </Group>
  );
};

const PayModelSelectItem = forwardRef<HTMLDivElement, PayModelMenuItem>(
  ({ icon, label, totalUsage }: PayModelMenuItem, ref) => (
    <div ref={ref}>
      <Group noWrap>
        <Text size="sm">{label}</Text>
        <Text size="sm">{totalUsage}</Text>
        {icon}
      </Group>
    </div>
  ),
);

PayModelSelectItem.displayName = 'PayModelSelectItem';

const PaymentPanel = () => {
  const { data, isLoading, isFetching, isError, error } =
    useGetWorkspacePayModelsQuery();

  const [selectedPayModel, setSelectedPayModel] = useState<string | null>(null);

  const usersPayModels = useDeepCompareMemo(() => {
    if (!data) return [];
    return data.allPayModels.map((payModel: PayModel): PayModelMenuItem => {
      return {
        value: payModel.bmh_workspace_id ?? payModel.workspace_type,
        label: payModel.workspace_type,
        totalUsage: payModel['total-usage'].toFixed(2),
        icon:
          payModel.request_status === 'active' ? (
            <ActiveIcon />
          ) : (
            <InactiveIcon />
          ),
      };
    });
  }, [data]);

  if (isLoading && isFetching) return <Loader />;

  if (isError) {
    if (isNoPayModelError(error)) {
      return <NoPayModel />;
    } else return <ErrorCard message="Unable to get Payment information" />;
  }

  return (
    <div>
      <LoadingOverlay visible={isLoading || isFetching} />
      <Accordion chevronPosition="left">
        <Accordion.Item value="accountInformation">
          <Accordion.Control>Account Information</Accordion.Control>
          <Accordion.Panel>
            <div className="grid grid-cols-3 p-4">
              <div className="flex flex-col border-1 border-gray p-2 mr-4">
                <div className="flex justify-between border-b-1 border-gray mb-2 w-full py-2">
                  <div className="ml-2 text-xs">Account</div>
                  <div className="mr-2 text-xs">Workspace Account Manager</div>
                </div>
                <div className="text-center">
                  <div>
                    <Select
                      placeholder="Select Workspace"
                      itemComponent={PayModelSelectItem}
                      data={usersPayModels}
                      onChange={setSelectedPayModel}
                      value={selectedPayModel}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col text-center border-1 border-gray p-2 mr-4">
                <div className="text-md border-b-1 border-gray mb-2 w-full py-2 text-xs">
                  Total Charges (USD)
                </div>
                <Text>
                  {PaymentNumberToString(data?.currentPayModel['total-usage'])}
                </Text>
                )
              </div>
              <div className="flex flex-col text-center border-1 border-gray p-2">
                <div className="text-md border-b-1 border-gray mb-2 w-full py-2 text-xs">
                  Spending Limit (USD)
                </div>
                <Text>
                  {PaymentNumberToString(data?.currentPayModel['hard-limit'])}
                </Text>
              </div>
            </div>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default PaymentPanel;
