import React, { useState } from 'react';
import {
  Card,
  TextInput,
  Textarea,
  Select,
  Switch,
  Button,
  FileInput,
  Stack,
  Title,
  Group,
  Text,
  Modal,
  Tabs,
  Alert,
} from '@mantine/core';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { AnalysisToolConfig } from './types';
import { AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import TextDescription from './TextDescription';

// File validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml'];

interface FileWithPreview extends File {
  preview?: string;
}

const AnalysisCardEditor = () => {
  const [cards, setCards] = useState<AnalysisToolConfig[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [previewCard, setPreviewCard] = useState<AnalysisToolConfig | null>(
    null,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [currentCard, setCurrentCard] = useState<
    AnalysisToolConfig & {
      iconFile?: FileWithPreview;
      imageFile?: FileWithPreview;
    }
  >({
    title: '',
    type: '',
    icon: '',
    image: '',
    description: '',
    loginRequired: false,
  });

  const validateFile = (
    file: File | null,
    type: 'icon' | 'image',
  ): string | null => {
    if (!file) return null;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload a JPEG, PNG, or SVG file.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 5MB limit.';
    }
    return null;
  };

  const handleFileChange = (file: File | null, field: 'icon' | 'image') => {
    const error = validateFile(file, field);
    if (error) {
      setErrors({ ...errors, [field]: error });
      return;
    }

    setErrors({ ...errors, [field]: '' });

    if (file) {
      const fileWithPreview = file as FileWithPreview;
      fileWithPreview.preview = URL.createObjectURL(file);

      setCurrentCard((prev) => ({
        ...prev,
        [`${field}File`]: fileWithPreview,
        [field]: file.name,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!currentCard.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!currentCard.type) {
      newErrors.type = 'Type is required';
    }
    if (!currentCard.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (editingIndex !== null) {
      const updatedCards = [...cards];
      updatedCards[editingIndex] = currentCard;
      setCards(updatedCards);
      setEditingIndex(null);
    } else {
      setCards((prev) => [...prev, currentCard]);
    }

    resetForm();
  };

  const resetForm = () => {
    setCurrentCard({
      title: '',
      type: '',
      icon: '',
      image: '',
      description: '',
      loginRequired: false,
    });
    setErrors({});
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setCurrentCard(cards[index]);
  };

  const handleDelete = (index: number) => {
    setCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(cards);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCards(items);
  };

  const CardPreview = ({ card }: { card: AnalysisToolConfig }) => (
    <div className="flex flex-col items-center w-full max-w-sm">
      <div className="rounded-sm bg-white w-full">
        <div className="p-0 rounded-sm relative h-48 bg-gray-200">
          {card.imageFile?.preview ? (
            <img
              src={card.imageFile.preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Preview Image
            </div>
          )}
        </div>
        <div className="flex -mt-5 relative z-10">
          <div className="p-0.5 rounded-sm bg-gray-100 ml-5 w-10 h-10">
            {card.iconFile?.preview ? (
              <img
                src={card.iconFile.preview}
                alt="Icon"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200" />
            )}
          </div>
          <div className="relative mb-0 ml-2">
            <span className="absolute bottom-0 left-0 text-xs text-gray-400 w-max">
              {card.type === 'application' ? 'Application' : 'Jupyter Notebook'}
            </span>
          </div>
        </div>
        <div className="flex flex-col mt-2 ml-2">
          <div className="text-sm font-black h-6">{card.title}</div>
          <div className="text-xs text-gray-400 h-6">
            {card.loginRequired ? 'Login Required' : ' '}
          </div>
          <div className="text-sm p-2 h-fit">
            <TextDescription description={card.description} />
          </div>
          <div className="flex mb-4 rounded-b-md h-6">
            {card.type === 'application' ? (
              <div className="m-auto">
                <button className="bg-blue-500 mr-2 text-white p-1.5 rounded-sm text-sm font-semibold">
                  Run App
                </button>
                <button className="bg-blue-500 ml-2 text-white p-1.5 rounded-sm text-sm font-semibold">
                  Demo
                </button>
              </div>
            ) : (
              <button className="m-auto bg-blue-500 text-white p-1.5 rounded-sm text-sm font-semibold">
                View Notebook
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Stack spacing="xl">
        <Title order={2}>Analysis Card Editor</Title>

        <Tabs defaultValue="edit">
          <Tabs.List>
            <Tabs.Tab value="edit">Edit</Tabs.Tab>
            <Tabs.Tab value="preview">Preview</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="edit" pt="xs">
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Stack spacing="md">
                <TextInput
                  required
                  label="Title"
                  placeholder="Enter tool title"
                  value={currentCard.title}
                  onChange={(e) =>
                    setCurrentCard((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  error={errors.title}
                />

                <Select
                  required
                  label="Type"
                  placeholder="Select tool type"
                  value={currentCard.type}
                  onChange={(value) =>
                    setCurrentCard((prev) => ({ ...prev, type: value || '' }))
                  }
                  data={[
                    { value: 'application', label: 'Application' },
                    { value: 'notebook', label: 'Jupyter Notebook' },
                  ]}
                  error={errors.type}
                />

                <Group grow>
                  <FileInput
                    label="Icon"
                    placeholder="Upload icon"
                    accept={ALLOWED_IMAGE_TYPES.join(',')}
                    onChange={(file) => handleFileChange(file, 'icon')}
                    error={errors.icon}
                  />

                  <FileInput
                    label="Preview Image"
                    placeholder="Upload preview image"
                    accept={ALLOWED_IMAGE_TYPES.join(',')}
                    onChange={(file) => handleFileChange(file, 'image')}
                    error={errors.image}
                  />
                </Group>

                <Textarea
                  required
                  label="Description"
                  placeholder="Enter tool description"
                  minRows={4}
                  value={currentCard.description}
                  onChange={(e) =>
                    setCurrentCard((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  error={errors.description}
                />

                <Switch
                  label="Login Required"
                  checked={currentCard.loginRequired}
                  onChange={(e) =>
                    setCurrentCard((prev) => ({
                      ...prev,
                      loginRequired: e.currentTarget.checked,
                    }))
                  }
                />

                <Group>
                  <Button onClick={handleSave} color="blue">
                    {editingIndex !== null ? 'Update Card' : 'Add Card'}
                  </Button>
                  {editingIndex !== null && (
                    <Button onClick={resetForm} color="gray">
                      Cancel Edit
                    </Button>
                  )}
                </Group>
              </Stack>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="preview" pt="xs">
            <CardPreview card={currentCard} />
          </Tabs.Panel>
        </Tabs>

        {cards.length > 0 && (
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Stack spacing="md">
              <Title order={3}>Added Cards ({cards.length})</Title>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="cards">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {cards.map((card, index) => (
                        <Draggable
                          key={index}
                          draggableId={`card-${index}`}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="mb-2"
                            >
                              <Card withBorder>
                                <Group position="apart">
                                  <div>
                                    <Text weight={500}>{card.title}</Text>
                                    <Text size="sm" color="dimmed">
                                      Type: {card.type}
                                    </Text>
                                    <Text size="sm" color="dimmed">
                                      Login Required:{' '}
                                      {card.loginRequired ? 'Yes' : 'No'}
                                    </Text>
                                  </div>
                                  <Group>
                                    <Button
                                      variant="light"
                                      size="xs"
                                      onClick={() => handleEdit(index)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      variant="light"
                                      color="red"
                                      size="xs"
                                      onClick={() => handleDelete(index)}
                                    >
                                      Delete
                                    </Button>
                                  </Group>
                                </Group>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <Button
                onClick={() => {
                  const dataStr = `export const centerList = ${JSON.stringify(cards, null, 2)};`;
                  const blob = new Blob([dataStr], { type: 'text/javascript' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.download = 'centerList.ts';
                  link.href = url;
                  link.click();
                }}
                color="green"
              >
                Export Cards
              </Button>
            </Stack>
          </Card>
        )}
      </Stack>
    </div>
  );
};

export default AnalysisCardEditor;
