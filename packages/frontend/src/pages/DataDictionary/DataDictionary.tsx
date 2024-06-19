import { DictionaryWithContext } from '../../features/Dictionary';
import { NavPageLayout } from '../../features/Navigation';
import { DictionaryPageProps } from './types';

const DictionaryPage = ({
  headerProps,
  footerProps,
  config,
}: DictionaryPageProps): JSX.Element => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps, mainProps: { fixed: true } }}
    >
      <DictionaryWithContext config={config} />
    </NavPageLayout>
  );
};

export default DictionaryPage;
