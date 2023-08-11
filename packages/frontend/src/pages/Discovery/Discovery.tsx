import { NavPageLayout } from '../../components/Navigation';
import Discovery from '../../components/Discovery/Discovery';
import { DiscoveryPageProps } from './types';
import { registerDiscoveryDefaultCellRenderers } from '../../components/Discovery';

const DiscoveryPage = ({
  headerProps,
  footerProps,
  discoveryConfig,
  mdsURL,
}: DiscoveryPageProps): JSX.Element => {

  registerDiscoveryDefaultCellRenderers();

  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <Discovery discoveryConfig={discoveryConfig} mdsURL={mdsURL} />
    </NavPageLayout>
  );
};

export default DiscoveryPage;
