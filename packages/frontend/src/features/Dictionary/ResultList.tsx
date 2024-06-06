import { Button } from '@mantine/core';

interface Result {
  node: string;
  category: string;
  property: string;
}

interface ResultListProps {
  matches?: Result[];
  term: string;
  expanded: boolean;
}
const ResultList = ({ matches, term, expanded }: ResultListProps) => {
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
              {
                node,
                category,
                property,
              }: { node: string; category: string; property: string },
              key: number,
            ) => {
              return (
                <div key={key} className="flex w-full p-0.5 pl-2">
                  <Button variant="subtle">
                    <p className="text-sm whitespace-nowrap overflow-hidden overflow-ellipsis">
                      {node} {'>'} {category}
                      {'>'} {property}
                    </p>
                  </Button>
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
