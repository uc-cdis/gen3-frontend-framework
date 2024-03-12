import { useGetWorkspaceOptionsQuery } from "@gen3/core";
import { Select } from "@mantine/core";
import { mockedPayload } from "./constants";


interface WorkspaceProps {

}

const Workspace = ({
}: WorkspaceProps) => {
  const { data } = useGetWorkspaceOptionsQuery();

  return (
    <div>
      <div className="flex flex-col gap-x-3 border-x-1 border-gray w-screen">
        <div className="border-b-1 border-gray p-2">Account Information</div>
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
      </div>
      <div className="flex w-11/12">
        {mockedPayload.map((card) => {
          return (<div className="flex flex-col border-1 border-gray ml-8 text-align w-1/5 h-60 items-center">
            <div className="font-semibold text-lg">{card.name}</div>
            <div className="text-sm text-gray">{card["cpu-limit"]} CPU, {card["memory-limit"]} memory</div>
            <button className="border-1 border-black  py-2 px-10 rounded mt-auto mb-2">Launch</button>
          </div>)
        })}
      </div>
    </div>
  );
};

export default Workspace;
