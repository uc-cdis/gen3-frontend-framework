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

const WorkspacePanelForm: React.FC = () => {
  const [workspaceInfo, setWorkspaceInfo] = useState<WorkspaceAdditionalInfo>(
    {},
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  const iconOptions = [
    { value: 'icon1', label: 'Icon 1' },
    { value: 'icon2', label: 'Icon 2' },
    { value: 'icon3', label: 'Icon 3' },
    // Add more icon options here
  ];

  const handleInputChange = (
    field: keyof WorkspaceAdditionalInfo,
    value: string | File,
  ) => {
    if (field === 'image' && value instanceof File) {
      setImageFile(value);
      setWorkspaceInfo((prev) => ({
        ...prev,
        [field]: URL.createObjectURL(value),
      }));
    } else {
      setWorkspaceInfo((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = () => {
    console.log('Workspace Info:', workspaceInfo);
    if (imageFile) {
      console.log('Image File:', imageFile);
    }
    // Submit logic here
  };

  return (
    <div>
      <TextInput
        label="Title"
        placeholder="Enter title"
        value={workspaceInfo.title || ''}
        onChange={(event) =>
          handleInputChange('title', event.currentTarget.value)
        }
      />
      <Textarea
        label="Description"
        placeholder="Enter description"
        value={workspaceInfo.description || ''}
        onChange={(event) =>
          handleInputChange('description', event.currentTarget.value)
        }
      />
      <Select
        label="Icon"
        placeholder="Select icon"
        data={iconOptions}
        value={workspaceInfo.icon}
        onChange={(value) => handleInputChange('icon', value!)}
      />
      <FileInput
        label="Image"
        accept="image/png,image/jpeg"
        onChange={(file: File) => handleInputChange('image', file)}
      />
      <Group position="right" mt="md">
        <Button onClick={handleSubmit}>Submit</Button>
      </Group>
    </div>
  );
};

export default WorkspaceForm;
