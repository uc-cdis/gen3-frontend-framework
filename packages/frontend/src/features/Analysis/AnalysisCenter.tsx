import React, { ReactElement, useState } from 'react';
import { AnalysisCenterConfiguration } from './types';
import { Select, TextInput } from '@mantine/core';
import AnalysisCard from './AnalysisCard';

const AnalysisCenter = ({
  tools,
  showFilterAndSort = false,
}: AnalysisCenterConfiguration): ReactElement => {
  const [cards, setCards] = useState({
    type: '' as string,
    access: '' as string,
    search: '',
  });

  const handleCardsFilter = (
    filterType: 'type' | 'access',
    selected: string | null,
  ) => {
    if (!selected?.length) return;
    setCards((c) => ({
      ...c,
      [filterType]: selected,
    }));
  };

  const handleCardsSearch = (keyword: string) => {
    if (!keyword.length) return;
  };

  return (
    <div className="w-full bg-base-lighter">
      {showFilterAndSort ? (
        <div className="flex justify-between items-center w-7/8 mt-2 mx-2">
          {/* // todo: for both dropdowns add downwards orange carrot */}
          <div className="flex space-x-4">
            <Select
              // todo: data opts
              data={[]}
              value={cards.type}
              comboboxProps={{
                transitionProps: {
                  transition: 'pop-top-left',
                  duration: 50,
                  timingFunction: 'ease',
                },
              }}
              placeholder="Filter by type"
              onChange={(value) => handleCardsFilter('type', value)}
            />
            <Select
              // todo: data opts
              data={[]}
              value={cards.access}
              comboboxProps={{
                transitionProps: {
                  transition: 'pop-top-left',
                  duration: 50,
                  timingFunction: 'ease',
                },
              }}
              placeholder="Filter by access"
              onChange={(value) => handleCardsFilter('access', value)}
            />
          </div>
          <div>
            {/* // todo: increase width of this */}
            <TextInput
              placeholder="Search in Analysis Center"
              value={cards.search}
              size="md"
              onChange={(event) => handleCardsSearch(event.currentTarget.value)}
            />
          </div>
        </div>
      ) : null}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-1 mx-4 overflow-y-scroll">
          {tools.map(
            (
              {
                title,
                description,
                type,
                icon,
                image,
                hasDemo,
                loginRequired,
                href,
                btnText,
              },
              key,
            ) => {
              return (
                <AnalysisCard
                  key={title}
                  {...{
                    title,
                    description,
                    type,
                    icon,
                    image,
                    hasDemo,
                    loginRequired,
                    href,
                    cardType: 'regular',
                    btnText,
                  }}
                />
              );
            },
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisCenter;
