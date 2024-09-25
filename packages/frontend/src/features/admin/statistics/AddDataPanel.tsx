import React, { useState } from 'react';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { TextInput, FileInput, Button, Modal } from '@mantine/core';

function DataUploadPanel() {
  const [name, setName] = useState('');
  const [file, setFile] = useState<Blob | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Validate if the uploaded file is a valid JSON
  const validateJson = (file: Blob): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!file) return resolve(false);
      const reader = new FileReader();
      reader.onload = () => {
        try {
          JSON.parse(reader.result as string);
          resolve(true);
        } catch (error) {
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate JSON file
    if (!file) {
      setModalMessage('The uploaded file is not a valid JSON.');
      setModalOpen(true);
      return;
    }

    const isValidJson = await validateJson(file);
    if (!isValidJson) {
      setModalMessage('The uploaded file is not a valid JSON.');
      setModalOpen(true);
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);

    try {
      // Replace 'YOUR_API_ENDPOINT' with your actual API endpoint
      const response = await axios.post('YOUR_API_ENDPOINT', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Handle success response
      notifications.show({
        title: 'Success',
        message: 'File uploaded successfully!',
      });
    } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred';

      // Check if error is an instance of Error
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Handle error response
      setModalMessage(`Upload failed: ${errorMessage}`);
      setModalOpen(true);
    }
  };

  return (
    <>
      <div style={{ maxWidth: 400, margin: 'auto', padding: '2rem' }}>
        <TextInput
          label="Name"
          placeholder="Enter name"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          required
        />
        <FileInput
          label="Upload JSON File"
          placeholder="Choose a file"
          accept=".json"
          onChange={setFile}
          required
        />
        <Button
          fullWidth
          mt="md"
          onClick={handleSubmit}
          disabled={!name || !file}
        >
          Submit
        </Button>
      </div>

      {/* Error Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="Invalid File"
      >
        <p>{modalMessage}</p>
        <Button onClick={() => setModalOpen(false)}>Close</Button>
      </Modal>
    </>
  );
}

export default DataUploadPanel;
