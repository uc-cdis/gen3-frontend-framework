import React, {
  useState,
} from 'react';
import { MdSearch as SearchIcon, MdClose as CloseIcon } from 'react-icons/md';
import { Button, Loader, TextInput } from '@mantine/core';
import { useAskQuestionMutation } from '@gen3/core';

const AISearchInput = () => {
  const [question, setQuestion] = useState('');
  const [
    askQuestion,
    { isLoading : isQuerying},
 // This is the destructured mutation result
  ] = useAskQuestionMutation()


  return (
    <div className="flex w-full my-2">
      <TextInput
        icon={<SearchIcon size={24} />}
        placeholder={'Ask a question...'}
        data-testid="textbox-ai-search-bar"
        aria-label="App Search Input"
        value={question}
        onChange={(event) => {
          setQuestion(event.target.value);
        }}
        classNames={{
          root: 'w-full',
          input: 'focus:border-2 focus:border-primary text-sm',
        }}
        size="sm"
        rightSection={
          isQuerying ? (<Loader size="xs" />) :
          setQuestion.length > 0 && !isQuerying && (
            <CloseIcon
              onClick={() => {
                setQuestion('');
              }}
              className="cursor-pointer"
              data-testid="search-input-clear-search"
            />
          )
        }
      />
      <Button size="sm" color="blue" variant="outline" radius="md" style={{marginLeft: "10px"}}
      onClick={() => askQuestion({
        query: question,
        })}
      >Ask</Button>
    </div>
  );
};

export default AISearchInput;
