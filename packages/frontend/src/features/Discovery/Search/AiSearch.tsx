import { useState, useEffect } from 'react';
import { MdClose as CloseIcon, MdInfo } from 'react-icons/md';
import { PiSparkleFill, PiTrash } from 'react-icons/pi';
import { TextInput, Loader, Tabs, Button, UnstyledButton, Title, Divider, Tooltip, Table } from '@mantine/core';
import { useAskQuestionMutation, AiSearchResponse } from '@gen3/core';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AiSearchProps {
  placeholder?: string;
  uidForStorage?: string;
}
interface HistoryObj {
  [key:string]: {
    loadingStarted: number;
    loadingEnded?: number;
    result?: AiSearchResponse;
  };
}
/**
 * AiSearch is an ai chatbot presenting as a searchbar
 * @param uidForStorage - optional id used to store search results Defaults to 'aiSearch'
 * @param placeholder - optional Defaults to 'e.g. Is there any data with subjects diagnosed with lung disease?'
*/
const AiSearch = ({
  placeholder = 'e.g. Is there any data with subjects diagnosed with lung disease?',
  uidForStorage = 'aiSearch',
}: AiSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermOnSubmit, setSearchTermOnSubmit] = useState('');
  const [aiSearchHistory, setAiSearchHistory] = useState<HistoryObj>({});
  const [resultAreaDisplayed, setResultAreaDisplayed] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [historyTableRows, setHistoryTableRows] = useState<[] | JSX.Element[]>([]);
  const [aiResponseDisplayed, setAiResponseDisplayed] = useState<AiSearchResponse | undefined>();
  const [activeTab, setActiveTab] = useState<string | null>('search');
  const [
    askQuestion,
    { isLoading: apiIsLoading, data: aiResponse},
    // This is the destructured mutation result
  ] = useAskQuestionMutation();

  const askAi = () => {
    if (!searchTerm) {
      return;
    }
    setSearchTermOnSubmit(searchTerm);

    //check if value has been searched for before
    if (aiSearchHistory[searchTerm]) {
      //if yes check if completed
      if (aiSearchHistory[searchTerm].result?.query) {
        //if yes return those results
        setAiResponseDisplayed(aiSearchHistory[searchTerm].result);
        setShowLoading(false);
        return;
      }
      //if no check time it was started and check if apiIsLoading
      if (apiIsLoading && aiSearchHistory[searchTerm].loadingStarted < (Date.now() + 60000)) {
        //wait longer
        return;
      }
      //otherwise do the api call again
    }


    //save search term
    setAiSearchHistory(searchHistory => ({
      ...searchHistory,
      [searchTerm]: {loadingStarted: Date.now()}
    }));


    //make API Call
    setShowLoading(true);
    askQuestion({
      query: searchTerm,
    });
    //clear old data
    setAiResponseDisplayed(undefined);
    //display loading/results area
    setResultAreaDisplayed(true);

  };
  useEffect(() => {
    //when api returns data show to user and store
    if (!aiResponse?.query) {
      return;
    }
    //if response matches current ask set setAiResponseDisplayed
    if (aiResponse?.query === searchTermOnSubmit) {
      setAiResponseDisplayed(aiResponse);
      setShowLoading(false);
    }

    //update Search History
    setAiSearchHistory(searchHistory => {
      const currentQuery = searchHistory[aiResponse.query];
      currentQuery.loadingEnded = Date.now();
      currentQuery.result = aiResponse;
      return {...searchHistory};
    });
  }, [aiResponse, searchTermOnSubmit]);

  useEffect(() => {
    //on load read session storage
    setAiSearchHistory(JSON.parse((sessionStorage.getItem(uidForStorage) || '{}')));
  }, [uidForStorage]);

  useEffect(() => {
    //when aiSearchHistory changes save to session storage
    if (aiSearchHistory) {
      sessionStorage.setItem(uidForStorage, JSON.stringify(aiSearchHistory));
    }
  }, [uidForStorage, aiSearchHistory]);

  const setCurrentSearch = (searchTerm:string) => {
    //set search to item
    setAiResponseDisplayed(aiSearchHistory[searchTerm].result);
    setSearchTerm(searchTerm);
    setShowLoading(false);
    setResultAreaDisplayed(true);

    //change tab to search tab
    setActiveTab('search');

  };

  const removeSearchHistory = (searchTerm:string) => {
    setAiSearchHistory(searchHistory => {
      delete searchHistory[searchTerm];
      return {...searchHistory};
    });
  };

  useEffect(() => {
    //update history table
    if (aiSearchHistory) {
      setHistoryTableRows(Object.keys(aiSearchHistory).map((searchTerm, index) => {
        const rowInfo = aiSearchHistory[searchTerm];
        return (
          <tr key={index}>
            <td>
              <button className="w-full text-left" onClick={()=>{setCurrentSearch(searchTerm);}}>{new Date(rowInfo.loadingStarted).toLocaleDateString()}</button>
            </td>
            <td>
              <button className="w-full text-left" onClick={()=>{setCurrentSearch(searchTerm);}}>{searchTerm}</button>
            </td>
            <td className="text-right">
              <Tooltip
                label="Delete"
                position="bottom"
                withArrow
                arrowSize={6}
              >
                <button className="text-red-600 hover:text-white hover:bg-red-600" onClick={()=>{removeSearchHistory(searchTerm);}}>
                  <PiTrash aria-label="Delete"/>
                </button>
              </Tooltip>
            </td>
          </tr>
        );
      }));
    }
  }, [aiSearchHistory]);

  return (
    <Tabs color="orange.8" className="w-full" classNames={{
      tab: 'data-[active=true]:font-bold !text-[16px]',
    }}  value={activeTab} onTabChange={setActiveTab}>
      <Tabs.List>
        <Tooltip
          label="AI is a powerful tool, but we cannot guarantee the accuracy of any responses. Feel free to copy and paste perceived dataset names or descriptions from the AI response into the real search bar to try and find any datasets the AI is referring to."
          position="bottom"
          withArrow
          arrowSize={6}
          multiline
          width={300}
        >
          <Tabs.Tab value="search" rightSection={<MdInfo className="text-[#C7501A]" aria-label="info icon"/>}>Ask AI About Available Data</Tabs.Tab>
        </Tooltip>
        <Tooltip
          label="Your history is only saved temporarily on this device."
          position="bottom"
          withArrow
          arrowSize={6}
          multiline
          width={300}
        >
          <Tabs.Tab value="history" rightSection={<MdInfo  className="text-[#C7501A]" aria-label="info icon"/>}>Search History</Tabs.Tab>
        </Tooltip>
      </Tabs.List>

      <Tabs.Panel value="search" pt="xs">
        <div className="relative">
          <TextInput
            placeholder={placeholder || 'Search...'}
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
            }}
            onKeyUp={(e) => e.key === 'Enter' && askAi()}
            classNames={{
              root: '',
              input: `!pr-[250px] ${resultAreaDisplayed && '!rounded-b-none !border-blue-600 !border-b-0'}`,
            }}
            size="lg"
          />
          <div className="absolute right-0 top-0 flex items-center">
            {searchTerm.length > 0 && (
              <UnstyledButton
                className="!bg-gray-100 inline-flex text-[#525252] !p-1 rounded-full mr-2"
                onClick={() => {
                  setSearchTerm('');
                  setSearchTermOnSubmit('');
                  if (showLoading) {
                    setResultAreaDisplayed(false);
                    setShowLoading(false);
                  }
                }}
              >
                Clear <CloseIcon aria-hidden />
              </UnstyledButton>
            )}
            <Button
              color="blue.8"
              type="submit"
              className="m-1"
              size="md"
              leftIcon={<PiSparkleFill aria-hidden />}
              onClick={askAi}
              >
              Ask AI
            </Button>
            </div>
        </div>
        <div aria-live="polite">
          {resultAreaDisplayed && (
            <div className="border border-blue-600 rounded-b bg-gray-100 py-6">
              {showLoading ? (
              <div className="text-center">
                <Loader color="orange.8" className="inline-block mb-4"/>
                <div>
                  AI response is loading. If you&apos;d like to cancel this search, press the &quot;Clear&quot; button.
                </div>
              </div>
              ) : (
              <div className="px-4">
                <Title order={5} className="pb-2">AI Response</Title>
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  {/** TODO interpret code and add expand */}
                  {aiResponseDisplayed?.response ? (
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // define some formatting for the ai response
                      p(props:any) {
                        const { node, ...rest } = props;
                        return (
                          <p
                            className="text-lg text-primary-contrast my-1"
                            {...rest}
                          />
                        );
                      },
                      ol(props:any) {
                        const { node, ...rest } = props;
                        return (
                          <ol
                            className="list-disc list-inside my-1"
                            {...rest}
                          />
                        );
                      },
                      ul(props:any) {
                        const { node, ...rest } = props;
                        return (
                          <ul
                            className="list-disc list-inside my-1"
                            {...rest}
                          />
                        );
                      },
                      li(props:any) {
                        const { node, ...rest } = props;
                        return <li className="text-md" {...rest} />;
                      },
                    }}
                  >
                    {aiResponseDisplayed?.response}
                  </Markdown>) : 'Something went wrong please refresh and try again'}
                </div>
                <Divider my="sm" />
                <Title order={5} className="pb-2">Referenced Sources</Title>
                {aiResponseDisplayed?.documents && aiResponseDisplayed.documents.length > 0 ?
                (
                <ul className="border-l-2 border-blue-600 pl-4 py-1">
                  {aiResponseDisplayed?.documents.map((document:AiSearchResponse['documents'][0], i:number)=>{
                    return (<li key={i} className="inline-block after:content-[','] pr-2 last:after:content-none">{document.metadata.source}</li>);
                  })}
                </ul>
                ) :(
                <div className="border-l-2 border-blue-600 pl-4 py-1">
                  No referenced sources available.
                </div>
                )}
              </div>
              )}
            </div>
          )}
        </div>
      </Tabs.Panel>

      <Tabs.Panel value="history" pt="xs">
        {historyTableRows.length > 0 ? (
        <Table highlightOnHover>
          <thead>
            <tr>
              <th className="w-24">Date</th>
              <th>Search Input</th>
              <th className="w-32">Clear History</th>
            </tr>
          </thead>
          <tbody>{historyTableRows}</tbody>
        </Table>
        ): (
          <Title order={5} className="p-2">No search history at this time</Title>
        )}
      </Tabs.Panel>
    </Tabs>
  );
};

export default AiSearch;
