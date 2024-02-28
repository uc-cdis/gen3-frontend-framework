import { useGetWorkspaceOptionsQuery } from "@gen3/core";
interface WorkspaceProps {

}

const Workspace = ({
}: WorkspaceProps) => {
  const { data } = useGetWorkspaceOptionsQuery();

  return <button onClick={() => console.log(data)}>workspace placeholder</button>;
};

export default Workspace;
