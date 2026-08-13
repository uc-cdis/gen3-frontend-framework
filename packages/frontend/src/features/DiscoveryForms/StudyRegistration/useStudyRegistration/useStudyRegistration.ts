import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { toString } from 'lodash';
import {
  selectUserDetails,
  useCoreSelector,
  useUpdateStudyInMDSMutation,
} from '@gen3/core';
import { FormOutcome } from '../types';
import { userCanRegisterStudy } from '../userCanRegisterStudy';
import { getClinicalTrialMetadata } from './getClinicalTrialMetadata';
import { preprocessStudyRegistrationMetadata } from './preprocessStudyRegistrationMetadata';
import { createCEDARInstance, cedarApi, updateStudyInMDS } from '@gen3/core';
import type { ActiveUser } from '../userCanRegisterStudy';
import type {
  RegisterableStudy,
  StudyRegistrationServiceResponse,
  UnregisteredStudiesfromMDS,
} from '../types';
import type {
  FormOnSubmitReturnProps,
  FormPropsBody,
} from '../../../../components/Content/Form';
import type {
  FormContentType,
  SelectOptionItem,
} from '../../../../components/Content/FormContent';
import type { CoreState } from '@gen3/core';
import type { StudyRegistrationFormConfig } from '../../../../pages/StudyForms/StudyRegistration/types';

export const useStudyRegistration = (
  config: StudyRegistrationFormConfig,
): {
  formError: string | undefined;
  formOutcome: FormOutcome;
  studyUID: string | null;
  formBody: FormPropsBody[];
  formOnSubmit: (formValues: FormOnSubmitReturnProps) => Promise<void>;
  isLoading: boolean;
} => {
  const [createCedarQuery] = cedarApi.useCreateCedarInstanceMutation();
  const [updateMdsQuery] = useUpdateStudyInMDSMutation();
  const [formError, setFormError] = useState<string>();
  const [formOutcome, setFormOutcome] = useState(FormOutcome.pending);
  // const [studyUID, setStudyUID] = useState<string | null>(null);
  const router = useRouter();
  const studyUID =
    typeof router.query.studyUID === 'string' ? router.query.studyUID : '';

  const [studies, setStudies] = useState<RegisterableStudy[]>([]);
  const userInfo = useCoreSelector((state: CoreState) =>
    selectUserDetails(state),
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch all unregistered studies from MDS
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          config.mdsURL +
            '/metadata?data=True&_guid_type=unregistered_discovery_metadata&limit=2000&offset=0',
        );

        if (!response.ok) {
          setFormOutcome(FormOutcome.error);
          setFormError(`HTTP error! status: ${response.status}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json: UnregisteredStudiesfromMDS = await response.json();
        const rawStudies = Object.values(json).map((entry) => {
          return entry.gen3_discovery || {};
        });
        setStudies(rawStudies);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setFormError(`HTTP error! status: ${err}`);
          throw new Error(`HTTP error! status: ${err}`);
        }
      } finally {
        setIsLoading(false);
      }
    };
    void fetchData();
  }, [config.mdsURL]);

  // Helper func for setting study from router query as the first one shown
  const moveStudyToFront = useCallback(
    (studies: RegisterableStudy[], studyUID: string) => {
      const targetIndex = studies.findIndex(
        (item) => item._hdp_uid === studyUID,
      );
      if (targetIndex > 0) {
        const [targetItem] = studies.splice(targetIndex, 1);
        studies.unshift(targetItem);
      }
      return studies;
    },
    [], // Empty array if it doesn't depend on outside hook state
  );

  const formBody: FormPropsBody[] = useMemo(() => {
    if (!studies.length) {
      return config.form.map((item) => ({
        ...item,
        type: item.type as FormContentType,
        initialValue: toString(item.initialValue),
      }));
    }
    // Filter based on active user permissions
    const registerableStudies = studies.filter((study) =>
      userCanRegisterStudy(
        userInfo as ActiveUser,
        study.registration_authz as string,
      ),
    );
    // Set pre-selected study as the first item in array
    const organizedRegistrableStudies = moveStudyToFront(
      registerableStudies,
      toString(studyUID),
    );
    const registerableStudyData = organizedRegistrableStudies.map(
      (study: RegisterableStudy) => {
        const metadata = study.study_metadata;
        return {
          label: `${(study.project_number as string) || 'N/A'} : ${
            metadata?.minimal_info?.study_name || 'N/A'
          } : ${metadata?.metadata_location?.nih_application_id || 'N/A'}`,
          value: study._hdp_uid,
        };
      },
    );
    // Autofill values for form:
    return config.form.map((item): FormPropsBody =>
      item.variable === 'study_id'
        ? {
            ...item,
            dropdownData: registerableStudyData as SelectOptionItem[],
            initialValue: registerableStudyData[0]?.value,
            errorText: toString(item.errorText),
            type: item.type as FormContentType,
          }
        : {
            ...item,
            dropdownData: item?.dropdownData
              ? item.dropdownData
              : ([] as SelectOptionItem[]),
            errorText: toString(item.errorText),
            initialValue: toString(item.initialValue),
            type: item.type as FormContentType,
          },
    );
  }, [moveStudyToFront, studies, userInfo, config.form, studyUID]);

  const formOnSubmit = async (formValues: FormOnSubmitReturnProps) => {
    setIsLoading(true);
    setFormError(undefined); // Reset previous errors
    const cedarUserUUID = formValues.cedar_uuid;
    const studyID = formValues.study_id;
    const ctgovID = formValues.clinical_trials_id;
    try {
      const valuesToUpdate = {
        repository: formValues.repository || '',
        repository_study_ids:
          !formValues.repository_study_ids ||
          (formValues.repository_study_ids.length === 1 &&
            formValues.repository_study_ids[0] === '')
            ? []
            : formValues.repository_study_ids,
        clinical_trials_id: ctgovID || '',
        clinicaltrials_gov: ctgovID
          ? await getClinicalTrialMetadata(config.clinicalTrialFields, ctgovID)
          : undefined,
      };
      // 1. Preprocess metadata
      const preprocessedMetadata = await preprocessStudyRegistrationMetadata(
        config,
        userInfo.username as string,
        studyID,
        valuesToUpdate,
      );
      // 2. Create CEDAR Instance
      const cedarResponse = (await createCEDARInstance(
        config.cedarWrapperURL as string,
        cedarUserUUID,
        preprocessedMetadata,
        createCedarQuery,
      )) as StudyRegistrationServiceResponse;
      // Check the returned result object
      if (cedarResponse.error) {
        setFormOutcome(FormOutcome.error);
        setFormError(cedarResponse.error);
        setIsLoading(false);
        return;
      }
      // 3. Update Study in MDS
      const mdsResponse = (await updateStudyInMDS(
        config.mdsURL as string,
        studyID,
        cedarResponse,
        updateMdsQuery,
      )) as StudyRegistrationServiceResponse;
      if (mdsResponse.error) {
        setFormOutcome(FormOutcome.error);
        setFormError(mdsResponse.error);
        setIsLoading(false);
        return;
      } else {
        // Everything was successful!
        setIsLoading(false);
        setFormOutcome(FormOutcome.success);
      }
    } catch (err: unknown) {
      console.error('Study registration pipeline failed:', err);
      // Extract readable error string
      const message = (err instanceof Error && err.message) || String(err);
      setFormOutcome(FormOutcome.error);
      setFormError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formError,
    formOutcome,
    studyUID,
    formBody,
    formOnSubmit,
    isLoading,
  };
};
