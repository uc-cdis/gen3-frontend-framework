import {
    MdKeyboardArrowDown as DownArrowIcon,
    MdKeyboardArrowUp as UpArrowIcon,
} from 'react-icons/md';
import ResultList from './ResultList';
import { useState } from 'react';

interface Result {
    node: string;
    category: string;
    property: string;
}

interface ResultCardProps {
    term: string;
    matches?: Result[]
}

const ResultCard = ({ term, matches }: ResultCardProps) => {
    const [expanded, setExpanded] = useState(false);
    return (<div>
        {expanded ?
            (<ResultList key={term} matches={matches} term={term} />) : (<ResultList key={term} matches={matches?.slice(0, 4)} term={term} />)
        }
        {matches && matches?.length > 4 ? <div className="flex w-full items-center border border-solid border-black border-t-0 rounded-b-md">
            {expanded ?
                (<button className="border-none py-1" onClick={() => setExpanded(false)}>
                    <div className="flex font-bold text-sm"><UpArrowIcon size={20} />Show Less</div></button>) :
                (<button className="border-none py-1" onClick={() => setExpanded(true)}><div className="flex font-bold text-sm"><DownArrowIcon size={20} />{matches.length - 4} More</div></button>)}
        </div> : <div className="border border-solid border-black border-t-0 rounded-b-md"></div>}
    </div>);
};

export default ResultCard;
