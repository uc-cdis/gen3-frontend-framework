import { ReactElement, useState } from 'react';
import { AnalysisCenterConfiguration } from './types';
import { Select, TextInput, Image, Stack, NavLink } from '@mantine/core';
import NextImage from 'next/image';
import Link from 'next/link';
import TextDescription from './TextDescription';

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
              },
              key,
            ) => {
              return (
                <Stack key={key}>
                  <div className="rounded-sm bg-base-max">
                    <div className="p-0 rounded-sm">
                      <Image
                        component={NextImage}
                        src={`/images/apps/${image}`}
                        alt={`${title} image`}
                        height={1000}
                        width={1000}
                        radius="md"
                      />
                    </div>
                    <div className="flex -mt-5 relative z-10">
                      <div className="p-0.5 rounded-sm bg-base-lightest ml-5 border-2 border-base">
                        <Image
                          component={NextImage}
                          src={`/icons/apps/${icon}`}
                          alt={`${title} logo`}
                          width={40}
                          height={40}
                          radius="lg"
                        />
                      </div>
                      <div className="relative mb-0 ml-2">
                        <span className="absolute bottom-0 left-0 text-xs text-gray-700 w-max">
                          {type === 'application'
                            ? 'Application'
                            : 'Jupyter Notebook'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col mt-2 ml-2">
                      <div className="text-sm font-black h-6">{title}</div>
                      <div className="text-xs text-gray-400 h-6">
                        {loginRequired ? 'Login Required' : ' '}
                      </div>
                      <div className="text-sm p-2 h-fit">
                        <TextDescription description={description} />
                      </div>
                      <div className="flex mb-4 rounded-b-md">
                        <div className="m-auto">
                          <NavLink
                            component={Link}
                            href={href ?? '_blank'}
                            classNames={{
                              root: 'bg-accent text-accent-contrast hover:bg-accent-darker p-2 rounded-sm',
                              label: 'text-sm font-semibold',
                            }}
                            label="Run"
                          />
                          {hasDemo && (
                            <button className="ml-2 p-1.5 rounded-sm text-sm font-semibold">
                              Demo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Stack>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisCenter;
