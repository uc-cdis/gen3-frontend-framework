import React, { useState } from 'react';
import {
  TextInput,
  Textarea,
  Select,
  FileInput,
  Button,
  Group,
} from '@mantine/core';
import { WorkspaceAdditionalInfo } from '../types';
import { useForm } from '@mantine/form';

interface FormValue {
  title: string;
  description: string;
  icon: string;
  imageFile: File[];
}

const WorkspacePanelForm: React.FC = () => {
  const [workspaceInfo, setWorkspaceInfo] = useState<WorkspaceAdditionalInfo>(
    {},
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<FormValue>({
    mode: 'uncontrolled',
    initialValues: {
      title: '',
      description: '',
      icon: '',
      imageFile: [],
    },
  });

  const handleSubmit = () => {
    console.log('Submission');
  };

  const iconOptions = [
    { value: 'icon1', label: 'Icon 1' },
    { value: 'icon2', label: 'Icon 2' },
    { value: 'icon3', label: 'Icon 3' },
    // Add more icon options here
  ];
  return (
    <div>
      <TextInput
        label="Title"
        placeholder="Enter title"
        key={form.key('title')}
        {...form.getInputProps('title')}
        onChange={(event) =>
          form.setFieldValue('title', event.currentTarget.value)
        }
      />
      <Textarea
        label="Description"
        placeholder="Enter description"
        {...form.getInputProps('description')}
        onChange={(event) =>
          form.setFieldValue('description', event.currentTarget.value)
        }
      />
      <Select
        label="Icon"
        placeholder="Select icon"
        data={iconOptions}
        {...form.getInputProps('icon')}
        onChange={(value) => form.setFieldValue('icon', value ?? '')}
      />
      <FileInput
        label="Image"
        accept="image/png,image/jpeg"
        {...form.getInputProps('imageFile')}
        onChange={(file: File | null) =>
          form.setFieldValue('imageFile', file ? [file] : [])
        }
      />
      <Group justify="right" mt="md">
        <Button onClick={handleSubmit}>Submit</Button>
      </Group>
    </div>
  );
};

export default WorkspacePanelForm;
