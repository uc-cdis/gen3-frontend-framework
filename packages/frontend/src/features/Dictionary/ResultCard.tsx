import {
  MdKeyboardArrowDown as DownArrowIcon,
  MdKeyboardArrowUp as UpArrowIcon,
} from 'react-icons/md';
import ResultList from './ResultList';
import { useState } from 'react';
import { MatchingSearchResult } from './types';

interface ResultCardProps {
  term: string;
  matches?: MatchingSearchResult[];
  selectItem: (_: MatchingSearchResult) => void;
}

const ResultCard = ({ term, matches, selectItem }: ResultCardProps) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      {expanded ? (
        <ResultList
          key={term}
          matches={matches}
          term={term}
          expanded={expanded}
          selectItem={selectItem}
        />
      ) : (
        <ResultList
          key={term}
          matches={matches?.slice(0, 4)}
          term={term}
          expanded={expanded}
          selectItem={selectItem}
        />
      )}
      {matches && matches?.length > 4 ? (
        <div className="flex w-full items-center border-2 border-solid border-base-light border-t-0 rounded-b-md">
          {expanded ? (
            <button
              className="border-none py-1"
              onClick={() => setExpanded(false)}
            >
              <div className="flex font-bold text-sm">
                <UpArrowIcon size={20} />
                Show Less
              </div>
            </button>
          ) : (
            <button
              className="border-none py-1"
              onClick={() => setExpanded(true)}
            >
              <div className="flex font-bold text-sm">
                <DownArrowIcon size={20} />
                {matches.length - 4} More
              </div>
            </button>
          )}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default ResultCard;
