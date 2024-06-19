import { Text, Highlight } from '@mantine/core';
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
          className={`flex flex-col border-2 border-solid border-base-light rounded-t-md ${
            matches.length < 4 || (!expanded && matches.length > 4)
              ? 'rounded-b-md'
              : 'border-b-0'
          }`}
        >
          <div className="p-2 border-b-2 border-base-light text-md font-bold bg-primary-lightest text-primary-contrast-lighter rounded-t-md">
            {term}
          </div>
          {matches.map(
            (
              { node, category, property }: MatchingSearchResult,
              key: number,
            ) => {
              return (
                <div key={key} className="flex w-full p-0.5 pl-2">
                  <Text
                    size="sm"
                    truncate="end"
                    className="w-full"
                    align="left"
                  >
                    <Highlight
                      component="button"
                      highlight={term}
                      align="left"
                      truncate="end"
                      className="w-full hover:bg-accent-lighter hover:text-accent-contrast-lighter p-1"
                      onClick={() => {
                        selectItem({
                          node,
                          category,
                          property,
                        });
                      }}
                    >
                      {`${snakeSplit(node)} > ${snakeSplit(
                        category,
                      )} > ${property}`}
                    </Highlight>
                  </Text>
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
