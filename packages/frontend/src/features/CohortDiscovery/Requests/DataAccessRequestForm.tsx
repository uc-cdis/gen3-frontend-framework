import React, { useState } from 'react';
import {
  TextInput,
  Button,
  Group,
  Box,
  Title,
  Text,
  Paper,
  Divider,
  Stack,
} from '@mantine/core';
import { useForm, isNotEmpty, isEmail, matches } from '@mantine/form';
import { DataAccessRequestUserInformation } from '../types';

export interface DataAccessRequestFormParams {
  cohortId: string;
  submitFunction: (
    cohortId: string,
    values: DataAccessRequestUserInformation,
  ) => void;
  close: () => void;
}

export const DataAccessRequestForm: React.FC<DataAccessRequestFormParams> = ({
  cohortId,
  submitFunction,
  close,
}) => {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<DataAccessRequestUserInformation>({
    initialValues: {
      name: '',
      email: '',
    },

    validate: {
      name: isNotEmpty('Name is required'),
      email: isEmail('Please provide a valid email'),
    },
  });

  const handleSubmit = async (values: DataAccessRequestUserInformation) => {
    submitFunction(cohortId, values);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Paper shadow="md" p="xl" radius="md">
        <Title order={2} mb="md" ta="center">
          Request Submitted
        </Title>
        <Text ta="center">
          Thank you for your data access request. We will review your submission
          and contact you shortly.
        </Text>
        <Group justify="center" mt="xl">
          <Button onClick={() => close()}>Dismiss</Button>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper radius="md">
      <Text c="dimmed" mb="lg">
        Please complete all fields to request access to our research data.
      </Text>
      <Divider mb="lg" />

      <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Full Name"
            placeholder="John Doe"
            withAsterisk
            {...form.getInputProps('name')}
          />

          <TextInput
            label="Email"
            placeholder="your.email@institution.edu"
            withAsterisk
            {...form.getInputProps('email')}
          />

          <Group justify="flex-end">
            <Button type="reset" variant="outline" onClick={() => form.reset()}>
              Reset
            </Button>
            <Button variant="outline" onClick={() => close()}>
              {submitted ? 'Close' : 'Cancel'}
            </Button>
            {!submitted && <Button type="submit">Submit Request</Button>}
          </Group>
        </Stack>
      </Box>
    </Paper>
  );
};

export default DataAccessRequestForm;
