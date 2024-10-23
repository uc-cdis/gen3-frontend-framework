import { ReactElement, useState } from 'react';
import { AnalysisCenterProps } from './types';
import { Select, Input } from '@mantine/core';
import Image from 'next/image';
import { centerList } from './utils';
import TextDescription from './TextDescription';

const AnalysisCenter = ({ analysis }: AnalysisCenterProps): ReactElement => {
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

  return (
    <div className="w-full bg-gray-100">
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
          <Input
            placeholder="Search in Analysis Center"
            value={cards.search}
            size="md"
          />
        </div>
      </div>
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-1 mx-4 overflow-y-scroll">
          {centerList.map(
            ({ title, description, type, icon, image, loginRequired }, key) => {
              return (
                <div key={key} className="flex flex-col items-center">
                  <div className="rounded-sm bg-white">
                    <div className="p-0 rounded-sm">
                      <Image
                        src={`/images/apps/${image}`}
                        alt="todo"
                        height={1000}
                        width={1000}
                      />
                    </div>
                    <div className="flex -mt-5 relative z-10">
                      <div className="p-0.5 rounded-sm bg-gray-100 ml-5">
                        <Image
                          src={`/icons/apps/${icon}`}
                          alt="todo"
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="relative mb-0 ml-2">
                        <span className="absolute bottom-0 left-0 text-xs text-gray-400 w-max">
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
                      <div className="flex mb-4 rounded-b-md h-6">
                        {type === 'application' ? (
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
            },
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisCenter;
