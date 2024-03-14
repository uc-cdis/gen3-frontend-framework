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

  const accessStyle = "flex w-full items-center rounded-sm border-2 py-3 px-1";

  return (
    <div className="flex mb-2">
      {(dataAccess.enabled &&
        studyData[accessibleFieldName]
        && (studyData[accessibleFieldName] === AccessLevel.ACCESSIBLE) ? (
          <div className={`${accessStyle} bg-green-100 border-green-500 text-black pl-2`}>
                 You have access to this data.
          </div>
        ) : (
          <div className={`${accessStyle} bg-yellow-100 border-yellow-500 text-black pl-2`}>
                You do not have access to this data.
          </div>
        ))}
    </div>
  );
};

export default DetailsAuthorizationIcon;
