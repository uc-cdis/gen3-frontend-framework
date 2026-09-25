import SubmitSowerJobButton from '../Sower/actions/SubmitSowerJobButton';
import { CreateAndExportOutputConfig } from '@gen3/core';

interface ListActionButtonProps {
  listId: string;
}

const ListActionButton = ({ listId }: ListActionButtonProps) => {
  const actions: CreateAndExportOutputConfig = {
    jobAction: {
      name: 'export-user-data-library',
      parameters: {
        listId,
      },
    },
  };

  return <SubmitSowerJobButton actions={actions} label="Export to PFB" />;
};

export default ListActionButton;
