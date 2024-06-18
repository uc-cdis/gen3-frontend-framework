import React, { useEffect, useRef, useState, MutableRefObject } from 'react';
import CategoryHeader from './CategoryHeader';
import { Accordion, Button, Group } from '@mantine/core';
import { useScrollIntoView } from '@mantine/hooks';
import CategoryAccordionLabel from './CategoryAccordionLabel';
import PropertiesTable from './PropertiesTable';
import { useDictionaryContext } from './DictionaryProvider';
import { DictionaryCategory } from './types';
import { useDeepCompareEffect } from 'use-deep-compare';
import { MdDownload as DownloadIcon } from 'react-icons/md';
import { ACCORDION_TRANSITION_DURATION } from './constants';
import { PropertyIdStringToSearchPath, toNodeCategory } from './utils';

interface CategoryPanel {
  category: string;
  selectedId: string;
  scrollToSelection: (ref: HTMLSpanElement) => void;
}

const CategoryPanel = ({
  category,
  selectedId,
  scrollToSelection,
}: CategoryPanel) => {
  const { dictionary, categories, config } = useDictionaryContext();
  const categoryInfo: Array<DictionaryCategory<string>> = categories[category];
  const [value, setValue] = useState<string | null>(selectedId);
  // const { scrollIntoView, targetRef, } =
  //   useScrollIntoView<HTMLSpanElement>({
  //     offset: 60,
  //   });
  const selectedItems = PropertyIdStringToSearchPath(selectedId);
  const itemRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  const appendRef = (id: string, el: HTMLSpanElement | null) => {
    itemRefs.current[id] = el;
  };

  const scrollToItem = (id: string) => {
    if (!itemRefs.current || itemRefs.current[id] == null) return;
    const elm = itemRefs.current[id];
    if (elm !== null) {
      scrollToSelection(elm);
    }
  };

  // set up a timeout to give the ref time to be rendered in it's final position withing the
  // page.
  useEffect(() => {
    if (
      value !== null &&
      value == toNodeCategory(selectedItems) &&
      selectedItems.property.length > 0
    ) {
      const timer = setTimeout(() => {
        scrollToItem(selectedId);
      }, 5); // Adjust the delay based on your accordion animation duration
      return () => clearTimeout(timer);
    }
  }, [scrollToItem, selectedId, selectedItems, value]);

  useDeepCompareEffect(() => {
    if (category == selectedItems.node)
      // set value only if this is the same root category
      setValue(`${selectedItems.node}-${selectedItems.category}`);
    else setValue(null);
  }, [selectedItems]);

  return (
    <div
      className="border-l-4 border-purple mt-2"
      key={`dictionary-entry-${category}`}
    >
      <CategoryHeader category={category} />
      <Accordion
        chevronPosition="left"
        value={value}
        onChange={setValue}
        transitionDuration={ACCORDION_TRANSITION_DURATION}
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
                {config?.showDownloads ? (
                  <Group noWrap className="ml-auto">
                    <Button leftIcon={<DownloadIcon />}>TSV</Button>
                    <Button leftIcon={<DownloadIcon />}>JSON</Button>
                  </Group>
                ) : null}
              </Group>
              <Accordion.Panel>
                <div className="ml-2">
                  <div className="flex flex-col mt-2">
                    <PropertiesTable
                      properties={dictionary[id].properties ?? {}}
                      required={dictionary[id].required}
                      category={category}
                      subCategory={id}
                      selectedProperty={selectedItems.property}
                      appendRef={appendRef}
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

export default React.memo(CategoryPanel, (prevProps, nextProps) => {
  const selectedItems = PropertyIdStringToSearchPath(nextProps.selectedId);
  // only rerender when selectedItem is for this panel's
  // category and it has changed.
  return (
    prevProps.category === nextProps.category &&
    selectedItems.node === prevProps.category &&
    prevProps.selectedId === nextProps.selectedId &&
    prevProps.scrollToSelection === nextProps.scrollToSelection
  );
});
