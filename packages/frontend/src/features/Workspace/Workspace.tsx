import { useGetWorkspaceOptionsQuery } from "@gen3/core";
import { Select } from "@mantine/core";
interface WorkspaceProps {

}

const Workspace = ({
}: WorkspaceProps) => {
  const { data } = useGetWorkspaceOptionsQuery();

  return (<div className="flex flex-col gap-x-3 border-x-1 border-gray w-screen">
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
  </div>);
};

export default Workspace;
