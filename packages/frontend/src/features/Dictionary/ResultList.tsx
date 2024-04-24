interface Result {
  node: string;
  category: string;
  property: string;
}

interface ResultListProps {
  matches?: Result[];
  term: string;
}
const ResultList = ({ matches, term }: ResultListProps) => {
  return (
    <>
      {matches?.length && (
        <div className="flex flex-col border border-solid border-black rounded-t-md border-b-0">
          <div className="p-1 border-b-1 border-black text-md font-bold bg-gray-100 rounded-t-md">
            {term}
          </div>
          {matches.map(
            ({
              node,
              category,
              property,
            }: {
              node: string;
              category: string;
              property: string;
            }) => {
              return (
                <div className="flex w-full p-0.5" key={`${node}-${category}-${property}`}>
                  <div className="text-xs whitespace-nowrap overflow-hidden overflow-ellipsis">
                    {node}
                    {' > '}
                    {category}
                    {' > '}
                    {property}
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}
    </>
  );
};

export default ResultList;
