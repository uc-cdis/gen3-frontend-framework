import {
  type CohortPersistenceSaveReplaceParameters,
  type ReplacePersistedCohortResults,
  type SavePersistedCohortResult,
} from '@gen3/core';

export interface DataFetchingResult<T> extends DataFetchingStatus {
  readonly data: T;
}

export interface DataFetchingStatus {
  readonly isSuccess?: boolean;
  readonly isFetching?: boolean;
  readonly isError?: boolean;
  readonly isUninitialized?: boolean;
  readonly error?: string;
}

export interface Cohort {
  readonly id: string;
  readonly name: string;
  readonly filters: Record<string, any>;
  readonly modified?: boolean;
  readonly modified_datetime: string;
  readonly saved?: boolean;
}

export type NotificationTypes =
  | 'newCohort'
  | 'deleteCohort'
  | 'savedCohort'
  | 'savedCohortSetCurrent'
  | 'savedCurrentCohort'
  | 'discardChanges'
  | 'error';

export interface CohortNotificationCommandWithParam {
  cmd: Omit<NotificationTypes, 'savedCurrentCohort' | 'discardChanges'>;
  param1: string;
  param2?: string;
}

export interface CohortNotificationCommandNoParam {
  cmd: 'savedCurrentCohort' | 'discardChanges';
}

export type CohortNotificationCommand =
  | CohortNotificationCommandWithParam
  | CohortNotificationCommandNoParam;

type SetCohortMessageFunc = (cmd: CohortNotificationCommand[]) => void;

export interface CohortHooks {
  useSelectCurrentCohort: () => Cohort;
  useSelectAvailableCohorts: () => Cohort[];
  useDeleteCohort: () => () => Promise<void>;
  useDiscardChanges: () => () => Promise<void>;
  useUpdateFilters?: () => () => void;
  useSetActiveCohort: () => (cohortId: string) => void;
  useAddUnsavedCohort: () => () => void;
  useSaveCohort: () => ({
    newName,
    cohortId,
    filters,
    caseFilters,
    createStaticCohort,
    saveAs,
  }: CohortPersistenceSaveReplaceParameters) => Promise<SavePersistedCohortResult>;
  useReplaceCohort: () => ({
    newName,
    filters,
    caseFilters,
    createStaticCohort,
    cohortId,
    saveAs,
  }: CohortPersistenceSaveReplaceParameters) => Promise<ReplacePersistedCohortResults>;
  useExportCohort?: () => {
    handleExport: () => void;
    status: DataFetchingStatus;
  };
  useImportCohort?: () => () => void;
  useCreateCohortExternally?: (setCohortMessage?: SetCohortMessageFunc) => void;
}
