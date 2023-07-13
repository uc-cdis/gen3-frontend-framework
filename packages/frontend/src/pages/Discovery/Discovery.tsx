import { NavPageLayout, NavPageLayoutProps } from '../../components/Navigation';
import Discovery, {
  DiscoveryProps,
} from '../../components/Discovery/Discovery';
import { DiscoveryPageProps } from './types';

const DiscoveryPage = ({
  headerProps,
  footerProps,
  columns,
  dataURL,
}: DiscoveryPageProps): JSX.Element => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <Discovery columns={columns} dataURL={dataURL} />
    </NavPageLayout>
  );
};

export default DiscoveryPage;
