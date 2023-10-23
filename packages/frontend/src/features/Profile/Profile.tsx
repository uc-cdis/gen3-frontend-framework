import User from '../../components/Profile/User';
import ProtectedContent from '../../components/Protected/ProtectedContent';
import Credentials from '../../components/Profile/Credentials';
import { Accordion } from '@mantine/core';

const Profile = () => {
  return (
    <ProtectedContent>
      <div className="flex flex-col">
        <Accordion multiple variant="separated" chevronPosition="left" defaultValue={["apiKeys"]}
        classNames={{
            label: 'text-secondary-contrast-lighter font-heading font-bold',
          }}>
          <Accordion.Item value="apiKeys">
            <div className="bg-secondary-lighter">
            <Accordion.Control >Current API Keys</Accordion.Control >
            </div>
            <Accordion.Panel>
              <Credentials />
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="resources" >
            <div className="bg-secondary-lighter">
              <Accordion.Control >Resources</Accordion.Control >
            </div>
          </Accordion.Item>
        </Accordion>

      </div>
    </ProtectedContent>
  );
};

export default Profile;
