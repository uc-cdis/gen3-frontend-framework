import { DictionaryWithContext } from '../../features/Dictionary';
import { NavPageLayout } from '../../features/Navigation';
import { DictionaryPageProps } from './types';
import dataDictionaryData from '../../features/Dictionary/data/dictionary.json';

const DictionaryPage = ({
  headerProps,
  footerProps,
}: // todo: pass dictionaryConfig instead of data
DictionaryPageProps): JSX.Element => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <DictionaryWithContext dictionary={dataDictionaryData} />
    </NavPageLayout>
  );
};

export default DictionaryPage;
