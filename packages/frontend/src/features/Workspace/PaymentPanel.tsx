import React, { forwardRef, ReactElement, useState } from 'react';
import {
  Accordion,
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
import { PaymentNumberToString } from './utils';

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
  const { data, isLoading, isFetching, isError } =
    useGetWorkspacePayModelsQuery();

  const [selectedPayModel, setSelectedPayModel] = useState<string | null>(null);

  const usersPayModels = useDeepCompareMemo(() => {
    if (!data) return [];
    return data.all_pay_models.map((payModel: PayModel): PayModelMenuItem => {
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

  if (isError) {
    return (
      <div className="flex w-full py-24 relative justify-center">
        <Text size={'xl'}>Error: unable to get Payment information</Text>
      </div>
    );
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
                {isLoading || isFetching ? (
                  <Loader />
                ) : (
                  <Text>
                    {PaymentNumberToString(
                      data?.current_pay_model['total-usage'],
                    )}
                  </Text>
                )}
              </div>
              <div className="flex flex-col text-center border-1 border-gray p-2">
                <div className="text-md border-b-1 border-gray mb-2 w-full py-2 text-xs">
                  Spending Limit (USD)
                </div>
                {isLoading || isFetching ? (
                  <Loader />
                ) : (
                  <Text>
                    {PaymentNumberToString(
                      data?.current_pay_model['hard-limit'],
                    )}
                  </Text>
                )}
              </div>
            </div>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default PaymentPanel;
