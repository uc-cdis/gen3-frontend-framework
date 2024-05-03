import {
  useGetWorkspaceOptionsQuery,
  // useGetWorkspaceRefreshQuery, useGetAccessTokenQuery
} from "@gen3/core";
import { Accordion, Select } from "@mantine/core";
import { mockedPayload } from "./constants";
import { WorkspaceConfiguration } from './types';


interface WorkspaceProps {
  config: WorkspaceConfiguration
}

const Workspace = ({
  config
}: WorkspaceProps) => {
  const { data } = useGetWorkspaceOptionsQuery();

  return (
    <div>
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
                        { value: 'trialWorkspace', label: 'Trial Workspace 0.00' },
                      ]}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col text-center border-1 border-gray p-2 mr-4">
                <div className="text-md border-b-1 border-gray mb-2 w-full py-2 text-xs">Total Charges (USD)</div>
                <span className="font-black text-xl">{"0.00"}</span>
              </div>
              <div className="flex flex-col text-center border-1 border-gray p-2">
                <div className="text-md border-b-1 border-gray mb-2 w-full py-2 text-xs">Spending Limit (USD)</div>
                <span className="font-black text-xl">{"0.00"}</span>
              </div>
            </div>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <div className="flex w-11/12 mt-10">
        {mockedPayload.map((card) => {
          return (<div className="flex flex-col border-1 border-gray ml-10 text-align w-1/4 h-80 items-center p-2 rounded-sm">
            <div className="font-semibold text-md p-2">{card.name}</div>
            <div className="flex justify-center items-center text-sm text-gray-500">{card["cpu-limit"]} CPU, {card["memory-limit"]} memory</div>
            <div className="flex justify-center items-center w-11/12 border-t-1 border-gray-300 hover:border-gray-400 focus:border-gray-400 mt-auto py-4">
              <button className="mx-auto border-1 border-black text-gray py-2 px-10 rounded">Launch</button>
            </div>
          </div>)
        })}
      </div>
    </div>
  );
};

export default Workspace;
