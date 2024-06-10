import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import CategoryHeader from './CategoryHeader';
import { Accordion, Button, Group } from '@mantine/core';
import CategoryAccordionLabel from './CategoryAccordionLabel';
import PropertiesTable from './PropertiesTable';
import { useDictionaryContext } from './DictionaryProvider';
import { DictionaryCategory } from './types';
import { useDeepCompareEffect } from 'use-deep-compare';
import { MdDownload as DownloadIcon } from 'react-icons/md';

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

interface CategoryPanel {
  category: string;
  selectedId: string;
}

const CategoryPanel = ({ category, selectedId }: CategoryPanel) => {
  const { dictionary, categories } = useDictionaryContext();
  const categoryInfo: Array<DictionaryCategory<string>> = categories[category];
  const [value, setValue] = useState<string | null>(selectedId);

  useDeepCompareEffect(() => {
    setValue(selectedId);
  }, [selectedId]);

  return (
    <div
      className="border-l-4 border-purple mt-2"
      key={`dictionary-entry-${category}`}
    >
      <CategoryHeader icon={getIcon(category)} category={category} />
      <Accordion
        chevronPosition="left"
        value={value}
        onChange={setValue}
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
            <Accordion.Item
              value={`${category}-${id}`}
              key={`${category}-${id}`}
            >
              <Group noWrap>
                <Accordion.Control>
                  <CategoryAccordionLabel
                    label={title}
                    description={description}
                  />
                </Accordion.Control>
                <Group noWrap className="ml-auto">
                  <Button leftIcon={<DownloadIcon />}>TSV</Button>
                  <Button leftIcon={<DownloadIcon />}>JSON</Button>
                </Group>
              </Group>
              <Accordion.Panel>
                <div className="ml-2">
                  <div className="flex flex-col mt-2">
                    <PropertiesTable
                      properties={dictionary[id].properties ?? {}}
                      required={dictionary[id].required}
                      category={category}
                      subCategory={id}
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
};

export default React.memo(CategoryPanel);
