import { NavPageLayout } from '../../components/Navigation';
import GqlQueryEditor from '../../features/Query/GqlQueryEditor';
import { QueryPageLayoutProps } from './types';

const QueryPage = ({
  headerProps,
  footerProps,
} : QueryPageLayoutProps ): JSX.Element => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <GqlQueryEditor />
    </NavPageLayout>
  );
};

export default QueryPage;
