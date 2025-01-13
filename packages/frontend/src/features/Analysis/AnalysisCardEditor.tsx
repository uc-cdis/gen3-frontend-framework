import React, { useCallback, useState } from 'react';
import {
  ActionIcon,
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
  Tabs,
  MultiSelect,
} from '@mantine/core';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { AnalysisToolConfig } from './types';
import { FiAlertTriangle as AlertTriangle } from 'react-icons/fi';
import {
  FaSearch as Search,
  FaUndo as Undo,
  FaRedo as Redo,
  FaUpload as Upload,
  FaDownload as Download,
} from 'react-icons/fa';
import Image from 'next/image';
import TextDescription from './TextDescription';

// File validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml'];
const MAX_HISTORY = 50;

interface HistoryState {
  past: AnalysisToolConfig[][];
  present: AnalysisToolConfig[];
  future: AnalysisToolConfig[][];
}

interface FileWithPreview extends File {
  preview?: string;
}

interface AnalysisToolConfigWithPreview extends AnalysisToolConfig {
  iconFile?: FileWithPreview;
  imageFile?: FileWithPreview;
}

const AnalysisCardEditor = () => {
  // Enhanced state management with history
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: [],
    future: [],
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: [] as string[],
    loginRequired: null as boolean | null,
  });

  const [currentCard, setCurrentCard] = useState<AnalysisToolConfigWithPreview>(
    {
      title: '',
      type: '',
      icon: '',
      image: '',
      description: '',
      loginRequired: false,
      href: '/',
    },
  );

  // Helper function to update history
  const updateHistory = useCallback(
    (newPresent: AnalysisToolConfigWithPreview[]) => {
      setHistory((prev) => ({
        past: [...prev.past, prev.present].slice(-MAX_HISTORY),
        present: newPresent,
        future: [],
      }));
    },
    [],
  );

  // Undo/Redo functions
  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;
      const newPast = prev.past.slice(0, -1);
      const newPresent = prev.past[prev.past.length - 1];
      return {
        past: newPast,
        present: newPresent,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;
      const [newPresent, ...newFuture] = prev.future;
      return {
        past: [...prev.past, prev.present],
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

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

    if (!currentCard.href.trim()) {
      newErrors.description = 'href is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDelete = (indices: number[]) => {
    const newCards = history.present.filter(
      (_, index) => !indices.includes(index),
    );
    updateHistory(newCards);
    setSelectedCards([]);
  };

  const handleDuplicate = (indices: number[]) => {
    const duplicates = indices.map((index) => ({
      ...history.present[index],
      title: `${history.present[index].title} (Copy)`,
    }));
    updateHistory([...history.present, ...duplicates]);
  };

  // Import/Export
  const handleImport = (file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = JSON.parse(content);
        const withImages = imported.map((card: AnalysisToolConfig) => {
          return {
            ...card,
            iconFile: { preview: card.icon },
            imageFile: { preview: card.image },
          };
        });
        if (Array.isArray(withImages)) {
          updateHistory(withImages);
        }
      } catch (error) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(history.present, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'analysis-cards.json';
    link.href = url;
    link.click();
  };

  // Filter cards
  const filteredCards = history.present.filter((card) => {
    const matchesSearch =
      card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      filters.type.length === 0 || filters.type.includes(card.type);
    const matchesLogin =
      filters.loginRequired === null ||
      card.loginRequired === filters.loginRequired;
    return matchesSearch && matchesType && matchesLogin;
  });

  // Enhanced drag and drop handling with history
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(history.present);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateHistory(items);
  };

  // Enhanced edit handling with history
  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setCurrentCard({
      ...history.present[index],
      // Reset file previews when editing
      iconFile: undefined,
      imageFile: undefined,
    });
  };

  // Enhanced save handling
  const handleSave = () => {
    if (!validateForm()) return;

    let newCards: AnalysisToolConfigWithPreview[];

    if (editingIndex !== null) {
      newCards = history.present.map((card, index) =>
        index === editingIndex
          ? {
              ...currentCard,
              // Remove the file preview properties before saving
              iconFile: undefined,
              imageFile: undefined,
            }
          : card,
      );
    } else {
      newCards = [
        ...history.present,
        {
          ...currentCard,
          // Remove the file preview properties before saving
          iconFile: undefined,
          imageFile: undefined,
        },
      ];
    }

    updateHistory(newCards);
    resetForm();
  };

  // Enhanced reset form
  const resetForm = () => {
    setCurrentCard({
      title: '',
      type: '',
      icon: '',
      image: '',
      description: '',
      loginRequired: false,
      href: '/',
    });
    setEditingIndex(null);
    setErrors({});
  };

  const BatchOperations = () => (
    <Group gap="xs">
      <Button
        size="xs"
        variant="light"
        color="red"
        onClick={() => handleDelete(selectedCards)}
        disabled={selectedCards.length === 0}
      >
        Delete Selected
      </Button>
      <Button
        size="xs"
        variant="light"
        onClick={() => handleDuplicate(selectedCards)}
        disabled={selectedCards.length === 0}
      >
        Duplicate Selected
      </Button>
      <Button
        size="xs"
        variant="light"
        onClick={() => setSelectedCards([])}
        disabled={selectedCards.length === 0}
      >
        Clear Selection
      </Button>
    </Group>
  );

  const FilterControls = () => (
    <Card shadow="xs" p="md">
      <Stack gap="xs">
        <TextInput
          leftSection={<Search size={16} />}
          placeholder="Search cards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
        />
        <MultiSelect
          data={[
            { value: 'application', label: 'Application' },
            { value: 'notebook', label: 'Jupyter Notebook' },
          ]}
          placeholder="Filter by type"
          value={filters.type}
          onChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}
        />
        <Select
          data={[
            { value: 'all', label: 'All' },
            { value: 'required', label: 'Login Required' },
            { value: 'not-required', label: 'No Login Required' },
          ]}
          placeholder="Filter by login requirement"
          value={
            filters.loginRequired === null
              ? 'all'
              : filters.loginRequired
                ? 'required'
                : 'not-required'
          }
          onChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              loginRequired: value === 'all' ? null : value === 'required',
            }))
          }
        />
      </Stack>
    </Card>
  );

  const CardPreview = ({ card }: { card: AnalysisToolConfigWithPreview }) => (
    <div className="flex flex-col items-center w-full max-w-sm">
      <div className="rounded-sm bg-white w-full">
        <div className="p-0 rounded-sm relative h-48 bg-gray-200">
          {card.imageFile?.preview ? (
            <Image
              src={`/images/apps/${card.imageFile.preview}`}
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
              <Image
                src={`/icons/apps/${card.iconFile.preview}`}
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
      <Stack gap="xl">
        <Title order={2}>Analysis Card Editor</Title>

        <Group>
          <Tabs defaultValue="edit">
            <Tabs.List>
              <Tabs.Tab value="edit">Edit</Tabs.Tab>
              <Tabs.Tab value="preview">Preview</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="edit" pt="xs">
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Stack gap="md">
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

                  <TextInput
                    required
                    label="href"
                    placeholder="Enter application path"
                    value={currentCard.href}
                    onChange={(e) =>
                      setCurrentCard((prev) => ({
                        ...prev,
                        href: e.target.value,
                      }))
                    }
                    error={errors.href}
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

          {history.present.length > 0 && (
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Stack gap="md">
                <Title order={3}>Added Cards ({history.present.length})</Title>

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="cards">
                    {(provided: any) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {history.present.map((card, index) => (
                          <Draggable
                            key={index}
                            draggableId={`card-${index}`}
                            index={index}
                          >
                            {(provided: any) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-2"
                              >
                                <Card withBorder>
                                  <Group justify="space-between">
                                    <div>
                                      <Text fw={500}>{card.title}</Text>
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
                                        onClick={() => handleDelete([index])}
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
              </Stack>
            </Card>
          )}
        </Group>

        <Group gap="xs">
          <ActionIcon
            onClick={undo}
            disabled={history.past.length === 0}
            title="Undo"
          >
            <Undo size={20} />
          </ActionIcon>
          <ActionIcon
            onClick={redo}
            disabled={history.future.length === 0}
            title="Redo"
          >
            <Redo size={20} />
          </ActionIcon>
          <FileInput
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
            id="import-file"
          />
          <Button
            variant="light"
            leftSection={<Upload size={16} />}
            onClick={() => document.getElementById('import-file')?.click()}
          >
            Import
          </Button>
          <Button
            variant="light"
            leftSection={<Download size={16} />}
            onClick={handleExport}
          >
            Export
          </Button>
        </Group>
      </Stack>
    </div>
  );
};

export default AnalysisCardEditor;
