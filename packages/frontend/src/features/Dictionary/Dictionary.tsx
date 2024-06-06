import React, { useState } from 'react';

import { Accordion, Button, Group } from '@mantine/core';

import {
  DictionaryCategory,
  DictionaryEntry,
  DictionaryProps,
  ViewType,
} from './types';
import { getPropertyCount } from './utils';

import { Icon } from '@iconify/react';
import CategoryHeader from './CategoryHeader';
import CategoryAccordionLabel from './CategoryAccordionLabel';
import ViewSelector from './ViewSelector';
import TableSearch from './TableSearch';
import { useDictionaryContext } from './DictionaryProvider';
import PropertiesTable from './PropertiesTable';

// TODO: need a more extensive icon library
//  Use icons from the icon library to enable
//  customization
const iconMapping: Record<string, string> = {
  administrative: 'administrative',
  data_observations: 'analysis',
  biospecimen: 'query',
  data_file: 'workspace',
  medical_history: 'profile',
};

const getIcon = (category: string) => {
  const iconName = iconMapping[category] ? iconMapping[category] : 'gen3';
  return <Icon color="primary-contrast.4" icon={`gen3:${iconName}`} />;
};

const Dictionary = ({ uidForStorage = 'dictionary' }: DictionaryProps) => {
  const [selectedId, setSelectedId] = useState('');
  const [view, setView] = useState<ViewType>('table');
  const { dictionary, categories, visibleCategories } = useDictionaryContext();

  const handleSelect = (id: string) => {
    setSelectedId((i) => (i === id ? '' : id));
  };

  return (
    <div className="flex m-2 bg-base-max">
      <div className="w-1/4 mr-4">
        <ViewSelector view={view} setView={setView} />
        <div className="p-4 text-sm">
          <span>
            The current commons dictionary has{' '}
            <span className="font-bold">{visibleCategories.length}</span> nodes
            and{' '}
            <span className="font-bold">
              {getPropertyCount(visibleCategories, dictionary)}
            </span>{' '}
            properties
          </span>
        </div>
        <TableSearch selectedId={selectedId} />
      </div>
      <div className="w-3/4">
        {Object.keys(categories).length &&
          Object.keys(categories).map((category) => {
            const categoryInfo: Array<DictionaryCategory<string>> =
              categories[category];
            return (
              <div
                className="border-l-4 border-purple mt-2"
                key={`dictionary-entry-${category}`}
              >
                <CategoryHeader icon={getIcon(category)} category={category} />
                <Accordion
                  chevronPosition="left"
                  defaultValue={selectedId}
                  styles={{
                    chevron: {
                      transform: 'rotate(-90deg)',
                      '&[data-rotate]': {
                        transform: 'rotate(0deg)',
                      },
                    },
                  }}
                >
                  {categoryInfo.map(({ title, description, id }) => {
                    return (
                      <Accordion.Item value={id} key={id}>
                        <Group noWrap>
                          <Accordion.Control>
                            <CategoryAccordionLabel
                              label={title}
                              description={description}
                            />
                          </Accordion.Control>
                          <Group noWrap className="ml-auto">
                            <Button>TSV</Button>
                            <Button>JSON</Button>
                          </Group>
                        </Group>
                        <Accordion.Panel>
                          <div className="ml-2">
                            <div className="flex flex-col mt-2">
                              <PropertiesTable
                                properties={dictionary[id].properties ?? {}}
                                required={dictionary[id].required}
                              />
                            </div>
                          </div>
                        </Accordion.Panel>
                      </Accordion.Item>
                    );
                  })}
                </Accordion>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default React.memo(Dictionary);
