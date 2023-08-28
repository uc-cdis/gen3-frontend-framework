import { NavPageLayout } from '../../components/Navigation';
import Discovery from '../../components/Discovery/Discovery';
import { DiscoveryPageProps } from './types';
import {
  registerDiscoveryDefaultCellRenderers,
  registerDiscoveryDefaultStudyPreviewRenderers
} from '../../components/Discovery';

registerDiscoveryDefaultCellRenderers();
registerDiscoveryDefaultStudyPreviewRenderers();

const DiscoveryPage = ({
  headerProps,
  footerProps,
  discoveryConfig,
}: DiscoveryPageProps): JSX.Element => {

  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <Discovery discoveryConfig={discoveryConfig} />
    </NavPageLayout>
  );
};

export default DiscoveryPage;
