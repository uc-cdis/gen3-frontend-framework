import { useGetWorkspaceOptionsQuery, type WorkspaceInfo } from '@gen3/core';
import { Accordion, Loader, LoadingOverlay, Select, Text } from '@mantine/core';
import { WorkspaceConfiguration } from './types';
import React from 'react';

interface WorkspaceProps {
  config: WorkspaceConfiguration;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Workspace = ({ config }: WorkspaceProps) => {
  const { data, isLoading, isError } = useGetWorkspaceOptionsQuery();

  if (isLoading) {
    return (
      <div className="flex w-full py-24 relative justify-center"><Loader  variant="dots"  /> </div>);
  }

  if (isError) {
    return (
      <div className="flex w-full py-24 h-100 relative justify-center">
        <Text size={'xl'}>Error: unable to get Payment information</Text>
      </div>);
  }

  return (
    <div className={'w-100 relative'}>
      <LoadingOverlay visible={isLoading} />
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
                      placeholder="Trial Workspace"
                      data={[
                        {
                          value: 'trialWorkspace',
                          label: 'Trial Workspace 0.00',
                        },
                      ]}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col text-center border-1 border-gray p-2 mr-4">
                <div className="text-md border-b-1 border-gray mb-2 w-full py-2 text-xs">
                  Total Charges (USD)
                </div>
                <span className="font-black text-xl">{'0.00'}</span>
              </div>
              <div className="flex flex-col text-center border-1 border-gray p-2">
                <div className="text-md border-b-1 border-gray mb-2 w-full py-2 text-xs">
                  Spending Limit (USD)
                </div>
                <span className="font-black text-xl">{'0.00'}</span>
              </div>
            </div>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <div className="flex w-11/12 mt-10">
        {data?.map((card: WorkspaceInfo) => {
          return (
            <div
              className="flex flex-col border-1 border-gray ml-10 text-align w-1/4 h-80 items-center p-2 rounded-sm"
              key={card.id}
            >
              <div className="font-semibold text-md p-2">{card.name}</div>
              <div className="flex justify-center items-center text-sm text-gray-500">
                {card.cpuLimit} CPU, {card.memoryLimit} memory
              </div>
              <div className="flex justify-center items-center w-11/12 border-t-1 border-gray-300 hover:border-gray-400 focus:border-gray-400 mt-auto py-4">
                <button className="mx-auto border-1 border-black text-gray py-2 px-10 rounded">
                  Launch
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Workspace;
