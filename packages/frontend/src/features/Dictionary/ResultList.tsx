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
    return (<div>
        {matches?.length && (<div className={`flex flex-col border border-solid border-black rounded-t-md ${matches.length < 4 || (!expanded && matches.length > 4) ? 'rounded-b-md' : 'border-b-0'}`}>
            <div className="p-1 border-b-1 border-black text-md font-bold bg-gray-100 rounded-t-md">{term}</div>
            {matches.map(({ node, category, property }: { node: string, category: string, property: string }, key: number) => {
                return (<div key={key} className="flex w-full p-0.5"><div className="text-xs whitespace-nowrap overflow-hidden overflow-ellipsis" >{node} {'>'} {category}{'>'} {property}</div></div>);
            })}
        </div>)}
    </div>);
};

export default ResultList;
