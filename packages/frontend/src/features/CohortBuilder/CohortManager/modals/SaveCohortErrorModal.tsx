import { ContextModalProps } from '@mantine/modals';
import { Button } from '@mantine/core';
import React from 'react';

const SaveCohortErrorModal = ({ context, id }: ContextModalProps) => (
  <>
    <p className="py-2 px-4">There was a problem saving the cohort.</p>
    <div
      className="bg-base-lightest flex p-4 gap-4 justify-end mt-4 rounded-b-lg sticky"
      data-testid="modal-button-container"
    >
      <Button onClick={() => context.closeModal(id)} variant="darkFunction">
        OK
      </Button>
    </div>
  </>
);

export default SaveCohortErrorModal;
