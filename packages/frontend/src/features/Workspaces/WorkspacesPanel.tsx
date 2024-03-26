import { useGetWorkspaceOptionsQuery } from '@gen3/core';

const WorkspacesPanel = () => {

    const { data, error, isLoading } = useGetWorkspaceOptionsQuery();

    console.log("Workspace data", data, error, isLoading );
    return (
        <div>
            <h1>Workspaces</h1>
        </div>
    );
};

export default WorkspacesPanel;
