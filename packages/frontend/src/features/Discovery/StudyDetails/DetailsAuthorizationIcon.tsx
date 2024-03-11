import { DataAuthorization, AccessLevel } from '../types';
import { JSONObject } from '@gen3/core';
import { Badge } from '@mantine/core';
import { FiUnlock as UnlockOutlined, FiLock as Locked } from 'react-icons/fi';
import { accessibleFieldName } from '../types';

interface DetailsAccessProps {
    readonly studyData: JSONObject;
    dataAccess: DataAuthorization;
};

const DetailsAuthorizationIcon = ({ studyData, dataAccess } : DetailsAccessProps) => {

  return (
    <div className="flex mb-2">
      {(dataAccess.enabled &&
        studyData[accessibleFieldName]
        && (studyData[accessibleFieldName] === AccessLevel.ACCESSIBLE) ? (
          <Badge size="xl" color="green" radius="xl" leftSection={<UnlockOutlined/>}>
                 You have access to this data.
          </Badge>
        ) : (
          <Badge
           size="xl" color="yellow" radius="xl" leftSection={<Locked/>}>
                You do not have access to this data.
          </Badge>
        ))}
    </div>
  );
};

export default DetailsAuthorizationIcon;
