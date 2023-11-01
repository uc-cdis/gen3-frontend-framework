import ProtectedContent from '../../components/Protected/ProtectedContent';
import Credentials from '../../components/Profile/Credentials';
import { Accordion } from '@mantine/core';
import { ResourcesPanel } from '../../components/Profile/ResourcesPanel';
import { ProfileProvider } from '../../components/Profile';
import { ProfileConfig } from '../../components/Profile';

export interface ProfileProps {
  profileConfig: ProfileConfig;
}

const Profile = ({ profileConfig }: ProfileProps) => {
  return (
    <ProtectedContent>
      <ProfileProvider profileConfig={profileConfig}>
        <div className="flex flex-col">
          <Accordion
            multiple
            variant="separated"
            chevronPosition="left"
            defaultValue={['apiKeys', 'resources']}
            classNames={{
              label: 'text-secondary-contrast-lighter font-heading font-bold',
            }}
          >
            <Accordion.Item value="apiKeys">
              <div className="bg-secondary-lighter">
                <Accordion.Control>Current API Keys</Accordion.Control>
              </div>
              <Accordion.Panel>
                <Credentials />
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="resources">
              <div className="bg-secondary-lighter">
                <Accordion.Control>Resources</Accordion.Control>
              </div>
              <Accordion.Panel>
                <ResourcesPanel />
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </div>
      </ProfileProvider>
    </ProtectedContent>
  );
};

export default Profile;
