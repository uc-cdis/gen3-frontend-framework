import Dictionary from './Dictionary';
import { DictionaryProps } from './types';
import DictionaryProvider from './DictionaryProvider';

const DictionaryWithContext = ({ config, dictionary }: DictionaryProps) => {
  return (
    <DictionaryProvider config={config} dictionary={dictionary}>
      <Dictionary />
    </DictionaryProvider>
  );
};

export default DictionaryWithContext;
