import User from '../../components/Profile/User';
import ProtectedContent from '../../components/Protected/ProtectedContent';
import Credentials from '../../components/Profile/Credentials';
import { Divider } from '@mantine/core';

const Profile = () => {
  return (
    <ProtectedContent>
      <div className="flex flex-col">
        <div className="flex justify-between">
          <User />
        </div>
        <Divider label="Credentials" />
        <Credentials />
      </div>
    </ProtectedContent>
  );
};

export default Profile;
