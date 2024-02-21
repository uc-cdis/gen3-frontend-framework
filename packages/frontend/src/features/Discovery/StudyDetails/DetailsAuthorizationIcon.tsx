import { DataAuthorization, AccessLevel } from "../types";
import { JSONObject } from "@gen3/core";
import {  Badge } from '@mantine/core';
import { FiUnlock as UnlockOutlined } from "react-icons/fi";
import { accessibleFieldName } from "../types";

interface DetailsAccessProps {
    readonly studyData: JSONObject;
    dataAccess: DataAuthorization;
};

const DetailsAuthorizationIcon = ({ studyData, dataAccess } : DetailsAccessProps) => {

  return (
    <div>
      {dataAccess.enabled &&
        studyData[accessibleFieldName]
        && (studyData[accessibleFieldName] === AccessLevel.ACCESSIBLE ? (
          <Badge pl={0} size="lg" color="green" radius="xl" leftSection={<UnlockOutlined/>}>
                 You have access to this data.
          </Badge>
        ) : (
          <Badge pl={0} size="lg" color="yellow" radius="xl" leftSection={<UnlockOutlined/>}>
                You do not have access to this data.
          </Badge>
        ))}
    </div>
  );
};

export default DetailsAuthorizationIcon;
