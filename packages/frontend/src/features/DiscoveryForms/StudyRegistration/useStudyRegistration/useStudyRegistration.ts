import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { toString } from 'lodash';
import {
  CoreState,
  selectUserDetails,
  useCoreSelector,
  JSONObject,
} from '@gen3/core';
import { FormOutcome } from '../types';
import {
  FormOnSubmitReturnProps,
  FormProps,
} from '../../../../components/Content/Form';
import { ActiveUser, userCanRegisterStudy } from '../userCanRegisterStudy';
import { getClinicalTrialMetadata } from './getClinicalTrialMetadata';
import { preprocessStudyRegistrationMetadata } from './preprocessStudyRegistrationMetadata';

export const useStudyRegistration = (
  config: any,
): {
  formError: string | undefined;
  formOutcome: FormOutcome;
  studyUID: string | null;
  formBody: FormProps['body'];
  formOnSubmit: (formValues: FormOnSubmitReturnProps) => Promise<void>;
  isLoading: boolean;
  data: any;
} => {
  const [formError, setFormError] = useState<string>();
  const [formOutcome, setFormOutcome] = useState(FormOutcome.pending);
  const [studyUID, setStudyUID] = useState<string | null>(null);
  const [studyName, setStudyName] = useState<string | null>(null);
  const router = useRouter();
  const [studies, setStudies] = useState<JSONObject[]>([]);
  const userInfo = useCoreSelector((state: CoreState) =>
    selectUserDetails(state),
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  // Fetch all unregistered studies from MDS
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        const response = await fetch(
          'https://healdata.org/mds/metadata?data=True&_guid_type=unregistered_discovery_metadata&limit=2000&offset=0',
        );

        if (!response.ok) {
          setIsError(true);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        const rawStudies = Object.values(json).map(
          (entry: any) => entry.gen3_discovery || {},
        );

        setStudies(rawStudies);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setIsError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Get values from router query
  useEffect(() => {
    if (router.isReady && router.query) {
      const { query } = router;
      if (query.studyUID) setStudyUID(query.studyUID as string);
      if (query.studyName) setStudyName(toString(query.studyName));
    }
  }, [router.isReady, router.query]);

  // Helper func for setting study from router query as the first one shown
  const moveStudyToFront = (studies: JSONObject[], studyUID: String) => {
    const targetIndex = studies.findIndex((item) => item._hdp_uid === studyUID);
    if (targetIndex > 0) {
      const [targetItem] = studies.splice(targetIndex, 1);
      studies.unshift(targetItem);
    }
    return studies;
  };

  const formBody = useMemo(() => {
    if (!studies.length || !userInfo) return config.form;
    // Filter based on active user permissions
    const registerableStudies = studies.filter((study) =>
      userCanRegisterStudy(userInfo as ActiveUser, study.registration_authz),
    );
    // Set pre-selected study as the first item in array
    const organizedRegistrableStudies = moveStudyToFront(
      studies,
      toString(studyUID),
    );
    // console.log('organizedRegistrableStudies', organizedRegistrableStudies);
    const registerableStudyData = organizedRegistrableStudies.map((study) => ({
      label: `${study.project_number || 'N/A'} : ${study.study_metadata?.minimal_info?.study_name || 'N/A'} : ${study.study_metadata?.metadata_location?.nih_application_id || 'N/A'}`,
      value: study._hdp_uid,
    }));
    console.log('registerableStudyData[0]', registerableStudyData[0]);
    // Autofill values for form:
    return config.form.map((item: any) =>
      item?.variable === 'study_id'
        ? {
            ...item,
            data: registerableStudyData,
            initialValue: registerableStudyData[0],
          }
        : item,
    );
  }, [studies, userInfo, config.form]);

  const [regRequestPending, setRegRequestPending] = useState(false);
  const formOnSubmit = async (formValues: FormOnSubmitReturnProps) => {
    console.log('formValues', formValues);
    alert('called formOnSubmit' + JSON.stringify(formValues));
    setRegRequestPending(true);
    const cedarUserUUID = formValues.cedar_uuid;
    const studyID = formValues.study_id;
    const ctgovID = formValues.clinical_trials_id;
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
    console.log('valuesToUpdate', valuesToUpdate);
    console.log('userInfo', userInfo);
    preprocessStudyRegistrationMetadata(
      config,
      // props.user.username,
      userInfo.username as string,
      studyID,
      valuesToUpdate,
    );
    /*.then(
      (preprocessedMetadata: JSONObject) => alert(JSON.stringify(preprocessedMetadata)
    )*/
  };
  /*         createCEDARInstance(cedarUserUUID, preprocessedMetadata).then(
          (updatedMetadataToRegister) =>
            updateStudyInMDS(studyID, updatedMetadataToRegister).then(() =>
              setFormSubmissionStatus({ status: 'success' }),
            ),
          (err) =>
            setFormSubmissionStatus({ status: 'error', text: err.message }),
        ),
      (err) => setFormSubmissionStatus({ status: 'error', text: err.message }),
    ); */

  /*     preprocessStudyRegistrationMetadata(
      props.user.username,
      studyID,
      valuesToUpdate,
    ).then(
      (preprocessedMetadata) =>
        createCEDARInstance(cedarUserUUID, preprocessedMetadata).then(
          (updatedMetadataToRegister) =>
            updateStudyInMDS(studyID, updatedMetadataToRegister).then(() =>
              setFormSubmissionStatus({ status: 'success' }),
            ),
          (err) =>
            setFormSubmissionStatus({ status: 'error', text: err.message }),
        ),
      (err) => setFormSubmissionStatus({ status: 'error', text: err.message }),
    );

 */

  return {
    formError,
    formOutcome,
    studyUID,
    formBody,
    formOnSubmit,
    isLoading,
    data: studies,
  };
};
