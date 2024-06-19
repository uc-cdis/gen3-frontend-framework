import {
  MdKeyboardArrowDown as DownArrowIcon,
  MdKeyboardArrowUp as UpArrowIcon,
} from 'react-icons/md';
import ResultList from './ResultList';
import { useState } from 'react';
import { MatchingSearchResult } from './types';

const MAX_UNEXPANDED_ITEMS = 4;

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
          matches={matches?.slice(0, MAX_UNEXPANDED_ITEMS)}
          term={term}
          expanded={expanded}
          selectItem={selectItem}
        />
      )}
      {matches && matches?.length > MAX_UNEXPANDED_ITEMS ? (
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
                {matches.length - MAX_UNEXPANDED_ITEMS} More
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
