import { UnstyledButton, Text, Highlight } from '@mantine/core';
import { MatchingSearchResult } from './types';
import { snakeSplit } from './utils';

interface ResultListProps {
  matches?: MatchingSearchResult[];
  term: string;
  expanded: boolean;
  selectItem: (_: MatchingSearchResult) => void;
}
const ResultList = ({
  matches,
  term,
  expanded,
  selectItem,
}: ResultListProps) => {
  return (
    <div>
      {matches?.length && (
        <div
          className={`flex flex-col border border-solid border-base-light rounded-t-sm ${
            matches.length < 4 || (!expanded && matches.length > 4)
              ? 'rounded-b-sm'
              : 'border-b-0'
          }`}
        >
          <div className="p-2 border-b-2 border-base-light text-md font-bold bg-primary-max text-primary-contrast-max rounded-t-sm">
            {term}
          </div>
          {matches.map(
            (
              { node, category, property }: MatchingSearchResult,
              key: number,
            ) => {
              return (
                <div key={key} className="flex w-full p-0.5 pl-2 justify-start">
                  <UnstyledButton
                    className="w-full py-1.5"
                    onClick={() => {
                      selectItem({
                        node,
                        category,
                        property,
                      });
                    }}
                  >
                    <Text size="sm" truncate="end" className="w-full">
                      <Highlight
                        component="div"
                        highlight={term}
                        truncate="end"
                        className="w-full hover:bg-accent-lighter hover:text-accent-contrast-lighter p-1"
                      >
                        {`${snakeSplit(node)} > ${snakeSplit(
                          category,
                        )} > ${property}`}
                      </Highlight>
                    </Text>
                  </UnstyledButton>
                </div>
              );
            },
          )}
        </div>
      )}
    </div>
  );
};

export default ResultList;
