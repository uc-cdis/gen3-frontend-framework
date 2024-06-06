import Dictionary from './Dictionary';
import { DictionaryConfigProps } from './types';
import DictionaryProvider from './DictionaryProvider';

const DictionaryWithContext = ({
  config,
  dictionary,
}: DictionaryConfigProps) => {
  return (
    <DictionaryProvider config={config} dictionary={dictionary}>
      <Dictionary dictionary={dictionary} />
    </DictionaryProvider>
  );
};

export default DictionaryWithContext;
