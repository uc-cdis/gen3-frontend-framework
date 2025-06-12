import React, { createContext, PropsWithChildren, useReducer } from 'react';
import { useDeepCompareCallback, useDeepCompareEffect } from 'use-deep-compare';
import { isEqual } from 'lodash';
import { showNotification } from '@mantine/notifications';
import {
  DeleteCohortNotification,
  DiscardChangesCohortNotification,
  ErrorCohortNotification,
  NewCohortNotification,
  SavedCohortNotification,
  SavedCohortNotificationWithSetAsCurrent,
  SavedCurrentCohortNotification,
} from './CohortNotifications';

import {
  CohortNotificationCommand,
  CohortNotificationCommandWithParam,
} from './types';

const cohortMessageReducer = (
  state: CohortNotificationCommand[],
  action:
    | { type: 'update'; payload: CohortNotificationCommand[] }
    | { type: 'clear'; payload: CohortNotificationCommand },
) => {
  switch (action.type) {
    case 'update':
      return [...state, ...action.payload];
    case 'clear':
      return state.filter((message) => !isEqual(message, action.payload));
    default:
      return state;
  }
};

export const CohortNotificationContext = createContext<
  ((cohortMessage: CohortNotificationCommand[]) => void) | undefined
>(undefined);

interface CohortNotificationWrapperProps extends PropsWithChildren {
  readonly useSetActiveCohort: () => (cohortId: string) => void;
}

const CohortNotificationProvider: React.FC<CohortNotificationWrapperProps> = ({
  useSetActiveCohort,
  children,
}) => {
  const [cohortMessage, dispatch] = useReducer(cohortMessageReducer, []);

  useDeepCompareEffect(() => {
    for (const message of cohortMessage) {
      switch (message.cmd) {
        case 'newCohort':
          showNotification({
            message: (
              <NewCohortNotification
                cohortName={
                  (message as CohortNotificationCommandWithParam).param1
                }
              />
            ),
            classNames: {
              description: 'flex flex-col content-center text-center',
            },
            autoClose: 5000,
            closeButtonProps: { 'aria-label': 'Close notification' },
            id: `new-cohort-${
              (message as CohortNotificationCommandWithParam).param1
            }`,
          });
          break;
        case 'deleteCohort':
          showNotification({
            message: (
              <DeleteCohortNotification
                cohortName={
                  (message as CohortNotificationCommandWithParam).param1
                }
              />
            ),
            classNames: {
              description: 'flex flex-col content-center text-center',
            },
            autoClose: 5000,
            closeButtonProps: { 'aria-label': 'Close notification' },
            id: `delete-cohort-${
              (message as CohortNotificationCommandWithParam).param1
            }`,
          });
          break;
        case 'savedCohort':
          showNotification({
            message: (
              <SavedCohortNotification
                cohortName={
                  (message as CohortNotificationCommandWithParam).param1
                }
              />
            ),
            classNames: {
              description: 'flex flex-col content-center text-center',
            },
            autoClose: 5000,
            closeButtonProps: { 'aria-label': 'Close notification' },
            id: `saved-cohort-${
              (message as CohortNotificationCommandWithParam).param1
            }`,
          });
          break;
        case 'savedCohortSetCurrent':
          showNotification({
            message: (
              <SavedCohortNotificationWithSetAsCurrent
                cohortName={
                  (message as CohortNotificationCommandWithParam).param1
                }
                cohortId={
                  (message as CohortNotificationCommandWithParam)
                    .param2 as string
                }
                useSetActiveCohort={useSetActiveCohort}
              />
            ),
            classNames: {
              description: 'flex flex-col content-center text-center',
            },
            autoClose: 5000,
            closeButtonProps: { 'aria-label': 'Close notification' },
            id: `saved-cohort-set-current-${
              (message as CohortNotificationCommandWithParam).param2
            }`,
          });
          break;
        case 'savedCurrentCohort':
          showNotification({
            message: <SavedCurrentCohortNotification />,
            classNames: {
              description: 'flex flex-col content-center text-center',
            },
            autoClose: 5000,
            closeButtonProps: { 'aria-label': 'Close notification' },
            id: 'saved-current-cohort',
          });
          break;
        case 'discardChanges':
          showNotification({
            message: <DiscardChangesCohortNotification />,
            classNames: {
              description: 'flex flex-col content-center text-center',
            },
            autoClose: 5000,
            closeButtonProps: { 'aria-label': 'Close notification' },
            id: 'discard-changes',
          });
          break;
        case 'error':
          showNotification({
            message: (
              <ErrorCohortNotification
                errorType={
                  (message as CohortNotificationCommandWithParam).param1
                }
              />
            ),
            classNames: {
              description: 'flex flex-col content-center text-center',
            },
            autoClose: 5000,
            closeButtonProps: { 'aria-label': 'Close notification' },
            id: `cohort-error-${
              (message as CohortNotificationCommandWithParam).param1
            }`,
          });
          break;
      }
      dispatch({ type: 'clear', payload: message });
    }
  }, [cohortMessage, useSetActiveCohort]);

  const updateCohortMessage = useDeepCompareCallback(
    (newMessages: CohortNotificationCommand[]) => {
      dispatch({ type: 'update', payload: newMessages });
    },
    [dispatch],
  );

  return (
    <CohortNotificationContext.Provider value={updateCohortMessage}>
      {children}
    </CohortNotificationContext.Provider>
  );
};

export default CohortNotificationProvider;
