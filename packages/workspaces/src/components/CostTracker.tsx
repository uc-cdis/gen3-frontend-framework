import React, { ReactElement, useState } from 'react';
import {
  Accordion,
  Center,
  Group,
  Loader,
  SelectProps,
  Text,
  Popover,
  Button,
  Progress,
  Divider,
  Radio,
} from '@mantine/core';
import {
  type PayModel,
  useGetWorkspacePayModelsQuery,
  useSetCurrentPayModelMutation,
} from '@gen3/core';
import { useDeepCompareCallback, useDeepCompareMemo } from 'use-deep-compare';
import {
  FaExclamationCircle as InactiveIcon,
  FaUser as ActiveIcon,
} from 'react-icons/fa';
import { MdExpandMore, MdOpenInNew } from 'react-icons/md';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { SerializedError } from '@reduxjs/toolkit';

// TODO rework once requirements are made

interface PayModelMenuItem {
  value: string;
  label: string;
  icon: ReactElement;
  totalUsage: number;
  currentPayModel: boolean; // temp
}

const PaymentNumberToString = (
  x: number | undefined,
  undefinedValue = 'N/A',
  precision = 2,
): string => {
  if (typeof x !== 'number' || Number.isNaN(x)) return undefinedValue;

  return x.toFixed(precision);
};


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
      className="p-2 border-1 border-l-0 border-r-0 border-base-lighter w-full h-16"
      justify="space-between"
    >
      <Text
        className="pl-4"
        size="md"
        classNames={{ root: 'font-heading text-utility-warning' }}
      >
        No pay model defined
      </Text>
    </Group>
  );
};

const CostTracker = ({workspaceAccountManagerTarget = ''}) => {
  const { data, isLoading, isFetching, isError, error } =
    useGetWorkspacePayModelsQuery(
      undefined,
      {
        pollingInterval: 120000, // 2 min
        refetchOnMountOrArgChange: true,
      }
    );

  const [setWorkspacePayModel] = useSetCurrentPayModelMutation();

  const [selectedPayModel, setSelectedPayModel] = useState<string | null>(null);

  const [opened, setOpened] = useState<boolean>(false);

  const setPayModel = useDeepCompareCallback(
    (id: string) => {
      void setWorkspacePayModel(id); // triggers the call to the service to select the pay model
      setSelectedPayModel(id); // set the paymodel value for the select component
    },
    [setWorkspacePayModel, selectedPayModel],
  );

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
            totalUsage: payModel['total-usage'],
            currentPayModel: payModel['current_pay_model'],//TODO temp rework with existing code
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
            ? data.currentPayModel.bmh_workspace_id
            : data.currentPayModel.workspace_type,
        totalUsage: data.currentPayModel['total-usage'],
        hardLimit: data.currentPayModel['hard-limit'],
      };
    }, [data]);

  const PayModelSelectItem: SelectProps['renderOption'] = ({ option }) => {
    const menuItem = usersPayModels[Number(option.value)];
    if (!menuItem) return null;
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
      <div className="flex justify-center p-2 border-1 border-l-0 border-r-0 border-base-lighter w-full h-14">
        <Loader />
      </div>
    );

  if (isError) {
    if (isNoPayModelError(error)) {
      return <NoPayModel />;
    } else
      return (
        <Center>
          Unable to get Payment information
          {/*<ErrorCard message="Unable to get Payment information" />*/}
        </Center>
      );
  }

  const ProgressBar = (className = '') => (
    <Progress
      size="sm"
      radius="xl"
      aria-label='Monthly Workflow Limit'
      value={!hardLimit ? 100 : (hardLimit / totalUsage) * 100}
      color={!hardLimit || totalUsage >= hardLimit ? 'red.5' : 'green.1'}
      className={className}
    />
  );

  return (
    <Popover
      width="target"
      position="bottom"
      shadow="lg"
      trapFocus
      opened={opened} onChange={setOpened}
    >
      <Popover.Target>
        <Button
          onClick={() => setOpened((o) => !o)}
          size="xs" 
          radius="xl"
          variant="default"
          className='h-[--badge-height]'
          rightSection={
            <MdExpandMore
              className="text-accent"
              size="1.5em"
              aria-label={opened ? 'close': 'open'}
              style={{
                transform: opened ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 200ms ease',
              }}
            />}
          >
            {ProgressBar('w-[110px]')}
            <span className='font-black pl-3 pr-2'>${PaymentNumberToString(totalUsage)}</span>
            <span className='font-normal'>/${PaymentNumberToString(hardLimit)}</span>
        </Button>
      </Popover.Target>
      <Popover.Dropdown className='px-2'>
        {workspaceAccountManagerTarget && <Button
          component="a"
          href={workspaceAccountManagerTarget}
          target="_blank"
          variant="outline"
          leftSection={
            <MdOpenInNew
              size="1.1em"
              aria-label='external'
            />}
          size="xs"
          className='w-full mb-4'
        >
          Workspace Account Manager
        </Button>}
        <Text size="sm" className='uppercase pb-2 px-2'>Limit <span className='font-black pl-1'>${PaymentNumberToString(hardLimit)}</span></Text>
        {ProgressBar('mx-2')}
        <Divider my="sm" />
        <Text size="sm" className='uppercase pb-2 px-2'>Account &amp; Charges</Text>
        <Accordion
          variant="unstyled"
          classNames={{
            root: '',
            control: 'p-0 px-2',
            label: 'p-0',
            chevron: 'text-accent',
            panel: 'p-0',
            content: 'p-0'
          }}
        >
          <Accordion.Item value="accountInformation">
            <Accordion.Control>
              <Text size="sm" className='font-black'>{workspaceName} - ${PaymentNumberToString(totalUsage)}</Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Radio.Group
                className='pt-2'
              >
                {usersPayModels.map((obj)=>(
                  <Radio.Card
                    checked={obj.currentPayModel}
                    disabled
                    key={obj.value}
                    className='p-2 border-none data-checked:bg-primary-lightest data-checked:border-primary-darker data-checked:font-black hover:bg-primary-max '
                  >
                    <Group wrap="nowrap" align="flex-start">
                      <Text size="sm" className='grow'>{obj.label}</Text>
                      <Text size="sm">${PaymentNumberToString(obj.totalUsage)}</Text>
                      <Radio.Indicator color='accent'/>
                    </Group>
                  </Radio.Card>
                ))}
              </Radio.Group>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Popover.Dropdown>
    </Popover>
  );
};

/*<Accordion chevronPosition="left">
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
                      onChange={(id) => {
                        if (id) setPayModel(id);
                      }}
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
      </Accordion>*/

export default CostTracker;