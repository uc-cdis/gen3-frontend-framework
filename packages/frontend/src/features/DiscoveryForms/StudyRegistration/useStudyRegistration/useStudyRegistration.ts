import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { toString } from 'lodash';
import {
  CoreState,
  selectUserDetails,
  useCoreSelector,
  JSONObject,
  useUpdateStudyInMDSMutation,
} from '@gen3/core';
import { FormOutcome, StudyRegistrationServiceResponse } from '../types';
import {
  FormOnSubmitReturnProps,
  FormProps,
} from '../../../../components/Content/Form';
import { ActiveUser, userCanRegisterStudy } from '../userCanRegisterStudy';
import { getClinicalTrialMetadata } from './getClinicalTrialMetadata';
import { preprocessStudyRegistrationMetadata } from './preprocessStudyRegistrationMetadata';
import { createCEDARInstance, cedarApi, updateStudyInMDS } from '@gen3/core';
import { StudyRegistrationFormConfig } from '../../../../pages/StudyForms/StudyRegistration/types';

export const useStudyRegistration = (
  config: StudyRegistrationFormConfig,
): {
  formError: string | undefined;
  formOutcome: FormOutcome;
  studyUID: string | null;
  formBody: FormProps['body'];
  formOnSubmit: (formValues: FormOnSubmitReturnProps) => Promise<void>;
  isLoading: boolean;
} => {
  const [createCedarQuery] = cedarApi.useCreateCedarInstanceMutation();
  const [updateMdsQuery] = useUpdateStudyInMDSMutation();
  const [formError, setFormError] = useState<string>();
  const [formOutcome, setFormOutcome] = useState(FormOutcome.pending);
  const [studyUID, setStudyUID] = useState<string | null>(null);
  const router = useRouter();
  const [studies, setStudies] = useState<JSONObject[]>([]);
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
        const json = await response.json();
        const rawStudies = Object.values(json).map(
          (entry: any) => entry.gen3_discovery || {},
        );

        setStudies(rawStudies);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setFormError(`HTTP error! status: ${err}`);
          throw new Error(`HTTP error! status: ${err}`);
        }
      } finally {
        setIsLoading(false);
      }
    };
    void fetchData();
  }, []);

  // Get values from router query
  useEffect(() => {
    if (router.isReady) {
      const { query } = router;
      if (query.studyUID) setStudyUID(query.studyUID as string);
    }
  }, [router.isReady, router.query]);

  // Helper func for setting study from router query as the first one shown
  const moveStudyToFront = (studies: JSONObject[], studyUID: string) => {
    const targetIndex = studies.findIndex((item) => item._hdp_uid === studyUID);
    if (targetIndex > 0) {
      const [targetItem] = studies.splice(targetIndex, 1);
      studies.unshift(targetItem);
    }
    return studies;
  };

  const formBody = useMemo(() => {
    if (!studies.length) {
      return config.form;
    }
    // Filter based on active user permissions
    const registerableStudies = studies.filter((study) =>
      userCanRegisterStudy(userInfo as ActiveUser, study.registration_authz as string),
    );
    // Set pre-selected study as the first item in array
    const organizedRegistrableStudies = moveStudyToFront(
      registerableStudies,
      toString(studyUID),
    );
    const registerableStudyData = organizedRegistrableStudies.map((study) => {
      const metadata = study.study_metadata as Record<string, any> | undefined;
      return {
        label: `${(study.project_number as string) || 'N/A'} : ${
          metadata?.minimal_info?.study_name || 'N/A'
        } : ${metadata?.metadata_location?.nih_application_id || 'N/A'}`,
        value: study._hdp_uid,
      };
    });
    // Autofill values for form:
    return config.form.map((item: any) =>
      item?.variable === 'study_id'
        ? {
            ...item,
            data: registerableStudyData,
            initialValue: registerableStudyData[0]?.value,
          }
        : item,
    );
  }, [studies, userInfo, config.form]);

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
      const cedarResponse = await createCEDARInstance(
        config.cedarWrapperURL as string,
        cedarUserUUID,
        preprocessedMetadata,
        createCedarQuery,
      ) as StudyRegistrationServiceResponse;
      // Check the returned result object
      if (cedarResponse.error) {
        setFormOutcome(FormOutcome.error);
        setFormError(cedarResponse.error);
        setIsLoading(false);
        return;
      }

      // 3. Update Study in MDS
      const mdsResponse = await updateStudyInMDS(
        config.mdsURL as string,
        studyID,
        cedarResponse,
        updateMdsQuery,
      ) as StudyRegistrationServiceResponse;
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
      const message = err instanceof Error && err.message || String(err);
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
