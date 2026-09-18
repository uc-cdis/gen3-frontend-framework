import React, { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import {
  Alert,
  Anchor,
  Button,
  Checkbox,
  Divider,
  Group,
  MultiSelect,
  SimpleGrid,
  Stack,
  Textarea,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { getRemoteSupportServiceRegistry } from '@gen3/core';
import type { VLMDSubmissionProps } from './types';
import type { CDEInfo, FormSubmissionStatus } from './types';
import { loadCDEInfoFromMDS, updateCDEMetadataInMDS } from './utils';

interface CDEFormValues {
  studyGrant: string;
  coreCDEs: string[];
  selectedCDEs: string[];
  firstName: string;
  lastName: string;
  email: string;
}

const CDESubmission = ({
  studyUID,
  studyNumber,
  studyName,
  userHasAccessToSubmit,
  disableCDESubmissionForm,
  config,
  existingCDENames = [],
}: VLMDSubmissionProps): ReactElement => {
  const [submissionStatus, setSubmissionStatus] =
    useState<FormSubmissionStatus | null>(null);
  const [cdeInfoFromMDS, setCDEInfoFromMDS] = useState<CDEInfo[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const initialStudyGrant =
    studyName || studyNumber
      ? `${studyName ?? 'N/A'} - ${studyNumber ?? 'N/A'}`
      : '';

  const form = useForm<CDEFormValues>({
    initialValues: {
      studyGrant: initialStudyGrant,
      coreCDEs: [],
      selectedCDEs: [],
      firstName: '',
      lastName: '',
      email: '',
    },
    validate: {
      firstName: (v) => (v.trim() ? null : 'First name is required'),
      lastName: (v) => (v.trim() ? null : 'Last name is required'),
      email: (v) =>
        /^\S+@\S+\.\S+$/.test(v) ? null : 'A valid email address is required',
    },
  });

  useEffect(() => {
    loadCDEInfoFromMDS()
      .then((cdeInfo) => {
        setCDEInfoFromMDS(cdeInfo);
        if (existingCDENames.length > 0) {
          const existingCore = cdeInfo
            .filter((e) => existingCDENames.includes(e.option) && e.isCoreCDE)
            .map((e) => e.option);
          const existingNonCore = cdeInfo
            .filter((e) => existingCDENames.includes(e.option) && !e.isCoreCDE)
            .map((e) => e.option);
          form.setValues({
            coreCDEs: existingCore,
            selectedCDEs: [...existingCore, ...existingNonCore],
          });
        }
      })
      .catch((err) => console.error('Failed to load CDE info from MDS:', err));
  }, [existingCDENames, existingCDENames.length, form]);

  const handleCoreCDEChange = (newCore: string[]) => {
    const nonCore = form.values.selectedCDEs.filter(
      (opt) => !cdeInfoFromMDS.find((e) => e.option === opt && e.isCoreCDE),
    );
    form.setValues({
      coreCDEs: newCore,
      selectedCDEs: [...newCore, ...nonCore],
    });
  };

  const handleAllCDEChange = (newSelected: string[]) => {
    const newCore = newSelected.filter((opt) =>
      cdeInfoFromMDS.find((e) => e.option === opt && e.isCoreCDE),
    );
    form.setValues({ coreCDEs: newCore, selectedCDEs: newSelected });
  };

  const handleSubmit = async () => {
    const result = form.validate();
    if (result.hasErrors) return;
    setSubmitting(true);

    const values = form.values;
    const selectedCDEInfo = cdeInfoFromMDS.filter((e) =>
      values.selectedCDEs.includes(e.option),
    );

    try {
      await updateCDEMetadataInMDS(
        studyUID ?? '',
        selectedCDEInfo,
        values.coreCDEs,
        config.variableMetadataField,
        config.gen3DiscoveryField,
        config.tagsListFieldName,
      );

      const hostname =
        typeof window !== 'undefined' ? window.location.hostname : '';
      const subject =
        `CDE submission for ${studyNumber ?? ''} ${studyName ?? ''}`.trim();
      const fullName = `${values.firstName} ${values.lastName}`;
      const contents = [
        `Grant Number: ${studyNumber ?? ''}`,
        `Study Name: ${studyName ?? ''}`,
        `Environment: ${hostname}`,
        `Study UID: ${studyUID ?? ''}`,
        `Selected CDEs: ${values.selectedCDEs.join(', ')}`,
      ].join('\n');

      const zendeskAction = getRemoteSupportServiceRegistry().getSupportService(
        config.remoteSupportService.service,
      );
      await zendeskAction(
        { subject, fullName, email: values.email, contents },
        config.remoteSupportService.configuration,
      );

      setSubmissionStatus({ status: 'success' });
    } catch (err) {
      setSubmissionStatus({
        status: 'error',
        text: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submissionStatus?.status === 'success') {
    return (
      <Stack>
        <Alert color="green" title="Your CDE selections have been submitted!">
          Thank you for your submission!{' '}
          <Anchor href="/discovery">Go to Discovery Page</Anchor>
        </Alert>
      </Stack>
    );
  }

  if (submissionStatus?.status === 'error') {
    return (
      <Stack>
        <Alert color="red" title="A problem occurred during submission">
          {submissionStatus.text}
        </Alert>
        <Button
          variant="outline"
          onClick={() => {
            setSubmitting(false);
            setSubmissionStatus(null);
          }}
        >
          Try Again
        </Button>
      </Stack>
    );
  }

  const coreCDEs = cdeInfoFromMDS.filter((e) => e.isCoreCDE);
  const allCDEOptions = cdeInfoFromMDS.map((e) => ({
    value: e.option,
    label: e.option,
  }));

  return (
    <Stack>
      <Divider label="HEAL CDEs" labelPosition="center" />
      {disableCDESubmissionForm ? (
        <Text size="sm" ta="center">
          We have received your CDE selections from the HEAL CDE team. If you
          need to update your selections, please contact{' '}
          <Anchor href="mailto:heal_cde@hsc.utah.edu">
            heal_cde@hsc.utah.edu
          </Anchor>
          .
        </Text>
      ) : (
        <Text size="sm" ta="center">
          Use this form to indicate which HEAL Common Data Elements (CDEs) are
          utilized in this study (select all that apply). View the HEAL CDE
          Repository{' '}
          <Anchor
            href="https://github.com/HEAL/heal-metadata-schemas"
            target="_blank"
            rel="noreferrer"
          >
            here
          </Anchor>
          .
        </Text>
      )}
      <Divider />
      <Text size="xs" c="dimmed">
        <Text span c="red">
          *
        </Text>{' '}
        Indicates required fields
      </Text>

      <Textarea
        label="Study Name - Grant Number"
        required
        disabled
        autosize
        {...form.getInputProps('studyGrant')}
      />

      <div>
        <Text size="sm" fw={500} mb="xs">
          Core CDEs
        </Text>
        <Checkbox.Group
          value={form.values.coreCDEs}
          onChange={handleCoreCDEChange}
        >
          <SimpleGrid cols={2} spacing="xs">
            {coreCDEs.map((cde) => (
              <Checkbox
                key={cde.guid}
                value={cde.option}
                label={cde.option}
                disabled={disableCDESubmissionForm}
              />
            ))}
          </SimpleGrid>
        </Checkbox.Group>
      </div>

      <MultiSelect
        label="All CDEs"
        description="Search and select from all CDEs"
        data={allCDEOptions}
        value={form.values.selectedCDEs}
        onChange={handleAllCDEChange}
        searchable
        clearable
        disabled={disableCDESubmissionForm}
      />

      <Divider
        label={
          <Tooltip label="This information will be used to contact you regarding your submission status. It is not stored on the HEAL Data Platform.">
            <Text size="sm">Administration ⓘ</Text>
          </Tooltip>
        }
        labelPosition="center"
      />

      <TextInput
        label="Submitter First Name"
        required
        disabled={disableCDESubmissionForm}
        {...form.getInputProps('firstName')}
      />
      <TextInput
        label="Submitter Last Name"
        required
        disabled={disableCDESubmissionForm}
        {...form.getInputProps('lastName')}
      />
      <TextInput
        label="E-mail Address"
        type="email"
        required
        disabled={disableCDESubmissionForm}
        {...form.getInputProps('email')}
      />

      <Group>
        {!userHasAccessToSubmit ? (
          <Tooltip label="You don't have permission to submit CDEs">
            <Button disabled>Submit CDEs</Button>
          </Tooltip>
        ) : (
          <Button
            onClick={handleSubmit}
            loading={submitting}
            disabled={disableCDESubmissionForm || submitting}
          >
            Submit CDEs
          </Button>
        )}
      </Group>
    </Stack>
  );
};

export default CDESubmission;
