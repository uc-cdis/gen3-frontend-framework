import { Tabs } from '@mantine/core';
import UserPanel from './Users/UserPanel';
import { Authz } from './types';
import { AuthzProvider } from './Provider';
import RolesPanel from './Roles/RolesPanel';
import PoliciesPanel from './Policies/PoliciesPanel';
import ResourcesPanel from './Resources/ResourcesPanel';

interface Gen3AuthzProps {
  authz: Authz;
}

const Gen3Authz = ({ authz }: Gen3AuthzProps) => {
  return (
    <div className="w-full">
      <h1>Gen3 Authz</h1>
      <AuthzProvider authz={authz}>
        <Tabs orientation="vertical" defaultValue="users">
          <Tabs.List>
            <Tabs.Tab value="users">Users</Tabs.Tab>
            <Tabs.Tab value="groups">Groups</Tabs.Tab>
            <Tabs.Tab value="resources">Resources</Tabs.Tab>
            <Tabs.Tab value="policies">Policies</Tabs.Tab>
            <Tabs.Tab value="roles">Roles</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="users" pl="xs">
            <UserPanel />
          </Tabs.Panel>
          <Tabs.Panel value="resources" pl="xs">
            <ResourcesPanel />
          </Tabs.Panel>
          <Tabs.Panel value="policies" pl="xs">
            <PoliciesPanel />
          </Tabs.Panel>
          <Tabs.Panel value="roles" pl="xs">
            <RolesPanel />
          </Tabs.Panel>
        </Tabs>
      </AuthzProvider>
    </div>
  );
};

export default Gen3Authz;
