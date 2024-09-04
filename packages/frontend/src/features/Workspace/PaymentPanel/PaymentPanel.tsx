import React, { ReactElement, useMemo, useState } from 'react';
import {
  Accordion,
  Box,
  Group,
  Loader,
  LoadingOverlay,
  Select,
  SelectProps,
  Text,
} from '@mantine/core';
import { type PayModel, useGetWorkspacePayModelsQuery } from '@gen3/core';
import { useDeepCompareMemo } from 'use-deep-compare';

const LIMITS_LABEL_STYLE = 'text-base-lighter font-medium text-sm opacity-90';

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
import StatusAndControls from '../StatusAndControls';

const isNoPayModelError = (error: FetchBaseQueryError | SerializedError) => {
  return (
    'status' in error &&
    error.status === 'PARSING_ERROR' &&
    error.originalStatus === 404
  );
};

const NoPayModel = () => {
  return (
    <Group
      className="p-2 border-1 border-l-0 border-r-0 border-base-lighter w-full"
      justify="space-between"
    >
      <Text className="pl-4" size="md">
        No pay model defined
      </Text>
      <StatusAndControls />
    </Group>
  );
};

const PaymentPanel = () => {
  const { data, isLoading, isFetching, isError, error } =
    useGetWorkspacePayModelsQuery();

  const [selectedPayModel, setSelectedPayModel] = useState<string | null>(null);

  const { usersPayModels, workspaceName, hardLimit, totalUsage } =
    useDeepCompareMemo(() => {
      if (!data)
        return {
          usersPayModels: [],
          selectedPayModel: [],
          workspaceName: 'Not Set',
          totalUsage: undefined,
          hardLimit: undefined,
        };
      const usersPayModels = data.allPayModels.map(
        (payModel: PayModel): PayModelMenuItem => {
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
        },
      );

      setSelectedPayModel(
        data.currentPayModel.bmh_workspace_id ??
          data.currentPayModel.workspace_type,
      );
      return {
        usersPayModels,
        workspaceName:
          data.currentPayModel.bmh_workspace_id.length > 0
            ? data.currentPayModel.bmh_workspace_id.length
            : data.currentPayModel.workspace_type,
        totalUsage: data.currentPayModel['total-usage'],
        hardLimit: data.currentPayModel['hard-limit'],
      };
    }, [data]);

  const PayModelSelectItem: SelectProps['renderOption'] = ({ option }) => {
    const menuItem = usersPayModels[Number(option.value)];
    return (
      <div>
        <Group wrap="nowrap">
          <Text size="sm">{menuItem.label}</Text>
          <Text size="sm">{menuItem.totalUsage}</Text>
          {menuItem.icon}
        </Group>
      </div>
    );
  };

  if (isLoading && isFetching)
    return (
      <Group
        className="p-2 border-1 border-l-0 border-r-0 border-base-lighter w-full h-14"
        justify="center"
      >
        <Loader />
      </Group>
    );

  if (isError) {
    if (isNoPayModelError(error)) {
      return <NoPayModel />;
    } else return <ErrorCard message="Unable to get Payment information" />;
  }

  return (
    <div>
      <Accordion chevronPosition="left">
        <Accordion.Item value="accountInformation">
          <Accordion.Control>
            <Group justify="space-between">
              Account Information
              <Group className="font-heading text-base-contrast">
                <Text fw={600}>{workspaceName}</Text>
                <div className="flex items-center">
                  <Text fw={500} size="sm" className="mr-1">
                    Total Usage:
                  </Text>
                  <Text fw={500} size="sm">
                    {PaymentNumberToString(totalUsage)}
                  </Text>
                </div>
                <div className="flex items-center pr-1">
                  <Text fw={500} size="sm" className="mr-1">
                    Hard Limit:
                  </Text>
                  <Text fw={500} size="sm">
                    {PaymentNumberToString(hardLimit)}
                  </Text>
                </div>
              </Group>
            </Group>
          </Accordion.Control>
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
                      renderOption={PayModelSelectItem}
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
                <Text>{PaymentNumberToString(totalUsage)}</Text>
              </div>
              <div className="flex flex-col text-center border-1 border-gray p-2">
                <div className="text-md border-b-1 border-gray mb-2 w-full py-2 text-xs">
                  Spending Limit (USD)
                </div>
                <Text>{PaymentNumberToString(hardLimit)}</Text>
              </div>
            </div>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default PaymentPanel;
