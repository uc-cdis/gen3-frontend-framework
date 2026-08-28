import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import Dictionary from './Dictionary';
import DictionaryProvider from './DictionaryProvider';
import { MAX_SEARCH_HISTORY } from './constants';
import data from './data/dictionary.json';
import { removeUnusedFieldsFromDictionaryObject } from './utils';

const meta = {
  component: Dictionary,
  decorators: [
    (Story) => (
      <div className="bg-primary-lighter p-4">
        <DictionaryProvider
          config={{
            showGraph: false,
            showDownloads: false,
            historyStorageId: 'dictionary-search-story',
            maxHistoryItems: MAX_SEARCH_HISTORY,
          }}
          dictionary={removeUnusedFieldsFromDictionaryObject(data)}
        >
          <Story />
        </DictionaryProvider>
      </div>
    ),
  ],
} satisfies Meta<typeof Dictionary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
