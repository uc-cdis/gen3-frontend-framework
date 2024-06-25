import React from 'react';
import { useGetWorkspaceOptionsQuery, type WorkspaceInfo } from '@gen3/core';
import { LoadingOverlay } from '@mantine/core';
import { WorkspaceConfiguration } from './types';
import ProtectedContent from '../../components/Protected/ProtectedContent';
import PaymentPanel from './PaymentPanel';

interface WorkspaceProps {
  config: WorkspaceConfiguration;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Workspace = ({ config }: WorkspaceProps) => {
  const { data, isLoading, isError } = useGetWorkspaceOptionsQuery();

  return (
    <ProtectedContent>
      <div className={'w-100 relative'}>
        <LoadingOverlay visible={isLoading} />
        <PaymentPanel />
        <div className="flex w-11/12 mt-10">
          <LoadingOverlay visible={isLoading} />
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
    </ProtectedContent>
  );
};

export default Workspace;
