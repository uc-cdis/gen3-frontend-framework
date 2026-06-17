import React from 'react';
import {
  NavPageLayout,
  NavPageLayoutProps,
} from '../../../features/Navigation';
import { useForm } from '@mantine/form';
import {
  TextInput,
  Radio,
  Group,
  Button,
  Text,
  Box,
  Stack,
} from '@mantine/core';

interface FormValues {
  studyName: string;
  firstName: string;
  lastName: string;
  email: string;
  institution: string;
  role: string;
}

const RequestAccessForm = ({
  headerProps,
  footerProps,
}: NavPageLayoutProps) => {
  const form = useForm<FormValues>({
    mode: 'controlled',
    initialValues: {
      studyName: '',
      firstName: '',
      lastName: '',
      email: '',
      institution: '',
      role: 'Principal Investigator',
    },
    validate: {
      studyName: (value) =>
        value ? null : 'Study Name - Grant Number is required',
      firstName: (value) => (value ? null : 'First Name is required'),
      lastName: (value) => (value ? null : 'Last Name is required'),
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : 'Invalid e-mail address',
      institution: (value) =>
        value ? null : 'Affiliated Institution is required',
      role: (value) => (value ? null : 'Please select a role'),
    },
  });

  const handleSubmit = (values: FormValues) => {
    console.log('Form Submitted Successfully:', values);
    // TODO: handle submission API logic here
  };

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Theme Page',
        content: 'Theme page',
        key: 'gen3-theme-page',
      }}
    >
      <div className="flex justify-items-center w-full">
        <Box className="w-full bg-white rounded-md m-8 p-8 ">
          {/* Top Header Section */}
          <div className="border-b font-medium text-sm text-gray-600 mb-6 mx-24">
            <div
              className="flex items-center justify-center my-4 before:flex-1
            before:border-t before:border-gray-200 after:flex-1
            after:border-t after:border-gray-200"
            >
              <span className="mx-4 tracking-wide">
                Study Registration Access Request
              </span>
            </div>
            <Text className="text-center mb-8 mx-auto">
              Please fill out this form to request and be approved for access to
              register your study with the HEAL Platform.
            </Text>
          </div>

          {/* Form Area */}
          <form
            onSubmit={form.onSubmit(handleSubmit)}
            className="max-w-4xl mx-auto"
          >
            {/* Required indicator note */}
            <div className="text-right text-xs text-neutral-500 mb-4">
              <span className="text-red-500 font-bold mr-1">*</span>Indicates
              required fields
            </div>

            <Stack gap="md">
              {/* Study Name */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-2 md:gap-4">
                <label className="text-right text-sm font-medium pt-2 md:col-span-1">
                  <span className="text-red-500 mr-1">*</span>Study Name - Grant
                  Number :
                </label>
                <div className="md:col-span-3">
                  <TextInput
                    {...form.getInputProps('studyName')}
                    classNames={{
                      input: 'focus:border-blue-500 rounded-sm min-h-[36px]',
                    }}
                  />
                </div>
              </div>

              {/* Registrant First Name */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-2 md:gap-4">
                <label className="text-right text-sm font-medium pt-2 md:col-span-1">
                  <span className="text-red-500 mr-1">*</span>Registrant First
                  Name :
                </label>
                <div className="md:col-span-3">
                  <TextInput
                    {...form.getInputProps('firstName')}
                    classNames={{
                      input: 'focus:border-blue-500 rounded-sm min-h-[36px]',
                    }}
                  />
                </div>
              </div>

              {/* Registrant Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-2 md:gap-4">
                <label className="text-right text-sm font-medium pt-2 md:col-span-1">
                  <span className="text-red-500 mr-1">*</span>Registrant Last
                  Name :
                </label>
                <div className="md:col-span-3">
                  <TextInput
                    {...form.getInputProps('lastName')}
                    classNames={{
                      input: 'focus:border-blue-500 rounded-sm min-h-[36px]',
                    }}
                  />
                </div>
              </div>

              {/* E-mail Address */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-2 md:gap-4">
                <label className="text-right text-sm font-medium pt-2 md:col-span-1">
                  <span className="text-red-500 mr-1">*</span>E-mail Address :
                </label>
                <div className="md:col-span-3">
                  <TextInput
                    type="email"
                    {...form.getInputProps('email')}
                    classNames={{
                      input: 'focus:border-blue-500 rounded-sm min-h-[36px]',
                    }}
                  />
                </div>
              </div>

              {/* Affiliated Institution */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-2 md:gap-4">
                <label className="text-right text-sm font-medium pt-2 md:col-span-1">
                  <span className="text-red-500 mr-1">*</span>Affiliated
                  Institution :
                </label>
                <div className="md:col-span-3">
                  <TextInput
                    {...form.getInputProps('institution')}
                    classNames={{
                      input: 'focus:border-blue-500 rounded-sm min-h-[36px]',
                    }}
                  />
                </div>
              </div>

              {/* Role on Project (Radio Options) */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-2 md:gap-4 mt-2">
                <label className="text-right text-sm font-medium pt-0.5 md:col-span-1">
                  <span className="text-red-500 mr-1">*</span>Role on Project :
                </label>
                <div className="md:col-span-3">
                  <Radio.Group {...form.getInputProps('role')}>
                    <Stack gap="xs" className="text-neutral-700">
                      <Radio
                        value="Principal Investigator"
                        label="Principal Investigator"
                        classNames={{
                          label: 'text-sm font-normal text-neutral-700',
                        }}
                      />
                      <Radio
                        value="Co-Principal Investigator"
                        label="Co-Principal Investigator"
                        classNames={{
                          label: 'text-sm font-normal text-neutral-700',
                        }}
                      />
                      <Radio
                        value="Co-Investigator"
                        label="Co-Investigator"
                        classNames={{
                          label: 'text-sm font-normal text-neutral-700',
                        }}
                      />
                      <Radio
                        value="Administrator"
                        label="Administrator"
                        classNames={{
                          label: 'text-sm font-normal text-neutral-700',
                        }}
                      />
                      <Radio
                        value="Clinical Collaborator"
                        label="Clinical Collaborator"
                        classNames={{
                          label: 'text-sm font-normal text-neutral-700',
                        }}
                      />
                      <Radio
                        value="Clinical Coordinator"
                        label="Clinical Coordinator"
                        classNames={{
                          label: 'text-sm font-normal text-neutral-700',
                        }}
                      />
                      <Radio
                        value="Data Analyst"
                        label="Data Analyst"
                        classNames={{
                          label: 'text-sm font-normal text-neutral-700',
                        }}
                      />
                      <Radio
                        value="Data Manager"
                        label="Data Manager"
                        classNames={{
                          label: 'text-sm font-normal text-neutral-700',
                        }}
                      />
                      <Radio
                        value="Research Coordinator"
                        label="Research Coordinator"
                        classNames={{
                          label: 'text-sm font-normal text-neutral-700',
                        }}
                      />
                      <Radio
                        value="Other"
                        label="Other..."
                        classNames={{
                          label: 'text-sm font-normal text-neutral-700',
                        }}
                      />
                    </Stack>
                  </Radio.Group>
                </div>
              </div>
            </Stack>

            {/* Buttons Action Container aligned with inputs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              <div className="hidden md:block md:col-span-1"></div>
              <div className="md:col-span-3">
                <Group gap="sm">
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 rounded-md transition-colors"
                  >
                    Submit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    className="border-blue-600 text-blue-600 hover:bg-blue-50 font-medium px-5 rounded-md transition-colors"
                  >
                    Reset
                  </Button>
                </Group>
              </div>
            </div>
          </form>

          {/* Footer Info Notice */}
          <div className="mt-12 pt-4 border-t border-neutral-100 max-w-4xl mx-auto">
            <Text className="text-xs text-neutral-500 leading-relaxed">
              Information provided on this page will be used for correspondence
              regarding your request and may be shared with the NIH and/or the
              HEAL Data Stewards
            </Text>
          </div>
        </Box>
      </div>
    </NavPageLayout>
  );
};

export default RequestAccessForm;
