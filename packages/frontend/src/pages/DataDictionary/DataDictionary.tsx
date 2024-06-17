import { DictionaryWithContext } from '../../features/Dictionary';
import { NavPageLayout } from '../../features/Navigation';
import { DictionaryPageProps } from './types';
import dataDictionaryData from '../../features/Dictionary/data/dictionary.json';
import { removeUnusedFieldsFromDictionaryObject } from '../../features/Dictionary/utils';

const DictionaryPage = ({
  headerProps,
  footerProps,
  config,
}: DictionaryPageProps): JSX.Element => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <DictionaryWithContext
        config={config}
        dictionary={removeUnusedFieldsFromDictionaryObject(dataDictionaryData)}
      />
    </NavPageLayout>
  );
};

export default DictionaryPage;
