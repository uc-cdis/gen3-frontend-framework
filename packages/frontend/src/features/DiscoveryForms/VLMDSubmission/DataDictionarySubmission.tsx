import React, { useState } from 'react';
import type { ReactElement } from 'react';
import {
  Alert,
  Anchor,
  Button,
  Divider,
  FileInput,
  Modal,
  Progress,
  Stack,
  Textarea,
  Text,
  TextInput,
  Tooltip,
  Badge,
  Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { getRemoteSupportServiceRegistry } from '@gen3/core';
import type { VLMDSubmissionProps } from './types';
import type { FormSubmissionStatus } from './types';
import {
  cleanUpFileRecord,
  generatePresignedURL,
  uploadToS3,
  validateDataDictionaryName,
} from './utils';

const ALLOWED_EXTENSIONS = ['.csv', '.tsv', '.json'];

interface DDFormValues {
  studyGrant: string;
  ddName: string;
  file: File | null;
  firstName: string;
  lastName: string;
  email: string;
}

const DataDictionarySubmission = ({
  studyUID,
  studyNumber,
  studyName,
  studyRegistrationAuthZ,
  userHasAccessToSubmit,
  config,
  existingDataDictionaryNames = [],
}: VLMDSubmissionProps): ReactElement => {
  const [submissionStatus, setSubmissionStatus] = useState<FormSubmissionStatus | null>(null);
  const [uploadProgress, setUploadProgress] = useState(100);
  const [uploading, setUploading] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [duplicateName, setDuplicateName] = useState<string | undefined>();

  const initialStudyGrant =
    studyName || studyNumber
      ? `${studyName ?? 'N/A'} - ${studyNumber ?? 'N/A'}`
      : '';

  const form = useForm<DDFormValues>({
    initialValues: {
      studyGrant: initialStudyGrant,
      ddName: '',
      file: null,
      firstName: '',
      lastName: '',
      email: '',
    },
    validate: {
      ddName: (v) => validateDataDictionaryName(v),
      file: (v) => {
        if (!v) return 'A file is required';
        if (v.size === 0) return 'File is empty';
        if (v.size > 10 * 1024 * 1024) return 'File size cannot exceed 10 MB';
        const ext = v.name.slice(v.name.lastIndexOf('.')).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext))
          return `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`;
        return null;
      },
      firstName: (v) => (v.trim() ? null : 'First name is required'),
      lastName: (v) => (v.trim() ? null : 'Last name is required'),
      email: (v) =>
        /^\S+@\S+\.\S+$/.test(v) ? null : 'A valid email address is required',
    },
  });

  const doUpload = async (values: DDFormValues) => {
    if (!values.file || !studyRegistrationAuthZ) {
      setSubmissionStatus({
        status: 'error',
        text: !values.file ? 'Invalid file' : 'Invalid authz info',
      });
      return;
    }

    try {
      setSubmissionStatus({ status: 'info', text: 'Preparing for upload…' });
      const { url, guid } = await generatePresignedURL(
        values.file.name,
        studyRegistrationAuthZ,
        config.dataDictionarySubmissionBucket,
      );

      setSubmissionStatus({ status: 'info', text: 'Uploading data dictionary…' });
      await uploadToS3(url, values.file, (pct) => setUploadProgress(pct));

      setSubmissionStatus({ status: 'info', text: 'Finishing upload…' });

      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const subject = `Data dictionary submission for ${studyNumber ?? ''} ${studyName ?? ''}`.trim();
      const fullName = `${values.firstName} ${values.lastName}`;
      const cliCmd = `argo submit -n argo --watch HEAL-Workflows/vlmd_submission_workflows/vlmd_submission_wrapper.yaml -p data_dict_guid=${guid} -p dictionary_name="${values.ddName}" -p study_id=${studyUID ?? ''}`;
      const contents = [
        `Grant Number: ${studyNumber ?? ''}`,
        `Study Name: ${studyName ?? ''}`,
        `Environment: ${hostname}`,
        `Study UID: ${studyUID ?? ''}`,
        `Data Dictionary GUID: ${guid}`,
        `Data Dictionary Name: ${values.ddName}`,
        `First Name: ${values.firstName}`,
        `Last Name: ${values.lastName}`,
        `E-mail Address: ${values.email}`,
        ``,
        `CLI Command: ${cliCmd}`,
      ].join('\n');

      try {
        const zendeskAction = getRemoteSupportServiceRegistry().getSupportService(
          config.remoteSupportService.service,
        );
        await zendeskAction(
          { subject, fullName, email: values.email, contents },
          config.remoteSupportService.configuration,
        );
        setSubmissionStatus({ status: 'success' });
      } catch (ticketErr) {
        await cleanUpFileRecord(guid);
        throw ticketErr;
      }
    } catch (err) {
      setSubmissionStatus({
        status: 'error',
        text: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  };

  const handleSubmitClick = async () => {
    const result = form.validate();
    if (result.hasErrors) return;
    setUploading(true);
    const values = form.values;
    if (existingDataDictionaryNames.includes(values.ddName)) {
      setDuplicateName(values.ddName);
      setConfirmModalOpen(true);
    } else {
      await doUpload(values);
    }
  };

  const handleConfirmOverwrite = async () => {
    setConfirmModalOpen(false);
    await doUpload(form.values);
  };

  if (submissionStatus?.status === 'success') {
    return (
      <Stack>
        <Alert color="green" title="Your Data Dictionary has been submitted!">
          Thank you for your submission! You will be notified via e-mail when
          processing is completed.{' '}
          <Anchor href="/discovery">Go to Discovery Page</Anchor>
        </Alert>
      </Stack>
    );
  }

  if (submissionStatus?.status === 'info') {
    return (
      <Stack>
        <Alert color="blue" title="Submitting data dictionary">
          Please do not close this page or navigate away.
          <Text size="sm" mt="xs">{submissionStatus.text}</Text>
        </Alert>
        <Progress value={uploadProgress} animated />
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
            setUploading(false);
            setSubmissionStatus(null);
          }}
        >
          Try Again
        </Button>
      </Stack>
    );
  }

  return (
    <>
      <Modal
        opened={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Overwrite"
        closeOnClickOutside={false}
      >
        <Text>
          A data dictionary named{' '}
          <Text span fw={700}>&quot;{duplicateName}&quot;</Text> is already
          associated with this study and will be overwritten. Are you sure?
        </Text>
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={() => { setUploading(false); setConfirmModalOpen(false); }}>
            No
          </Button>
          <Button onClick={handleConfirmOverwrite}>Yes</Button>
        </Group>
      </Modal>

      <Stack>
        <Divider label="Data Dictionary Submission" labelPosition="center" />
        <Text size="sm" ta="center">
          Data dictionaries must conform to the HEAL variable-level metadata (VLMD) schema.{' '}
          <Anchor href="https://heal.github.io/platform-documentation/vlmd/vlmd_tools/" target="_blank" rel="noreferrer">
            View instructions
          </Anchor>{' '}
          for creating HEAL-compliant VLMD. Examples are available{' '}
          <Anchor href="https://github.com/HEAL/heal-metadata-schemas/tree/main/variable-level-metadata-schema/examples" target="_blank" rel="noreferrer">
            here
          </Anchor>.
        </Text>
        <Text size="xs" c="dimmed">
          <Text span c="red">*</Text> Indicates required fields
        </Text>

        <Textarea
          label="Study Name - Grant Number"
          required
          disabled
          autosize
          {...form.getInputProps('studyGrant')}
        />

        <FileInput
          label="Select Data Dictionary File"
          required
          accept={ALLOWED_EXTENSIONS.join(',')}
          description="Supported file types: CSV, TSV, JSON; Maximum file size: 10 MB"
          placeholder="Click to select a file"
          {...form.getInputProps('file')}
        />

        <TextInput
          label="Data Dictionary Name"
          required
          {...form.getInputProps('ddName')}
        />

        {existingDataDictionaryNames.length > 0 && (
          <Stack gap="xs">
            <Text size="sm">This study is already linked to data dictionaries:</Text>
            <Group gap="xs">
              {existingDataDictionaryNames.map((name) => (
                <Badge key={name} variant="outline">{name}</Badge>
              ))}
            </Group>
            <Text size="sm" c="dimmed">Using an existing name will overwrite it.</Text>
          </Stack>
        )}

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
          {...form.getInputProps('firstName')}
        />
        <TextInput
          label="Submitter Last Name"
          required
          {...form.getInputProps('lastName')}
        />
        <TextInput
          label="E-mail Address"
          type="email"
          required
          {...form.getInputProps('email')}
        />

        {!userHasAccessToSubmit ? (
          <Tooltip label="You don't have permission to submit a data dictionary">
            <Button disabled>Submit data dictionary</Button>
          </Tooltip>
        ) : (
          <Button
            onClick={handleSubmitClick}
            loading={uploading}
            disabled={uploading}
          >
            Submit data dictionary
          </Button>
        )}
      </Stack>
    </>
  );
};

export default DataDictionarySubmission;
