import React, { useState, useCallback } from 'react';
import {
  Card,
  TextInput,
  Select,
  Button,
  FileInput,
  Stack,
  Title,
  Group,
  ActionIcon,
  MultiSelect,
} from '@mantine/core';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { AnalysisToolConfig } from './types';
import TextDescription from './TextDescription';
import { FiAlertTriangle as AlertTriangle } from 'react-icons/fi';
import {
  FaSearch as Search,
  FaUndo as Undo,
  FaRedo as Redo,
  FaUpload as Upload,
  FaDownload as Download,
} from 'react-icons/fa';
import { useForm } from '@mantine/form';

interface FileWithPreview extends File {
  preview?: string;
}

interface HistoryState {
  past: AnalysisToolConfig[][];
  present: AnalysisToolConfig[];
  future: AnalysisToolConfig[][];
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml'];
const MAX_HISTORY = 50;

interface FileWithPreview extends File {
  preview?: string;
}

interface AnalysisToolConfigPreview extends AnalysisToolConfig {
  iconFile?: FileWithPreview;
  imageFile?: FileWithPreview;
}

const AnalysisCardEditor = () => {
  const [cards, setCards] = useState<AnalysisToolConfig[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [previewCard, setPreviewCard] = useState<AnalysisToolConfig | null>(
    null,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [currentCard, setCurrentCard] = useState<AnalysisToolConfigPreview>({
    title: '',
    type: '',
    icon: '',
    image: '',
    description: '',
    loginRequired: false,
  });

  // UI state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: [] as string[],
    loginRequired: null as boolean | null,
  });

  // Helper function to update history
  const updateHistory = useCallback((newPresent: AnalysisToolConfig[]) => {
    setHistory((prev) => ({
      past: [...prev.past, prev.present].slice(-MAX_HISTORY),
      present: newPresent,
      future: [],
    }));
  }, []);

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

  // File handling
  const handleFileChange = (file: File | null, field: 'icon' | 'image') => {
    const error = validateFile(file);
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

  // Validation
  const validateFile = (file: File | null): string | null => {
    if (!file) return null;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload a JPEG, PNG, or SVG file.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 5MB limit.';
    }
    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!currentCard.title.trim()) newErrors.title = 'Title is required';
    if (!currentCard.type) newErrors.type = 'Type is required';
    if (!currentCard.description.trim())
      newErrors.description = 'Description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Card operations
  const handleSave = () => {
    if (!validateForm()) return;

    const newCards = [...history.present];
    if (editingIndex !== null) {
      newCards[editingIndex] = currentCard;
    } else {
      newCards.push(currentCard);
    }

    updateHistory(newCards);
    form.reset();
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
        if (Array.isArray(imported)) {
          updateHistory(imported);
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

  // UI Components
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

  // Main render
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Stack gap="xl">
        <Group justify="space-between">
          <Title order={2}>Analysis Card Editor</Title>
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
        </Group>

        {/* Rest of the component remains the same as before, just add the new BatchOperations
            and FilterControls components where appropriate */}

        {/* Previous form, preview, and card list components here */}
      </Stack>
    </div>
  );
};

export default AnalysisCardEditor;
