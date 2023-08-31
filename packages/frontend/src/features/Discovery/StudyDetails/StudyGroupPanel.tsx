import { StudyTabGroup } from '../types';
import { JSONObject } from '@gen3/core';
import StudyGroup from './StudyGroup';

interface StudyGroupPanelProps {
  readonly groups: StudyTabGroup[];
  readonly data: JSONObject;
}

const StudyGroupPanel = ({ data, groups }: StudyGroupPanelProps) => {
  return (
    <div className="flex flex-col my-2">
      {groups.map(({ header, fields }) => {
        return (
          <StudyGroup
            data={data}
            header={header}
            fields={fields}
            key={`${header}-study-group`}
          />
        );
      })}
    </div>
  );
};

export default StudyGroupPanel;
