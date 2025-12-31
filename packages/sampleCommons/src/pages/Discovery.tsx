import DiscoveryPage from '@gen3/frontend/pages/Discovery/Discovery';
import { DiscoveryPageGetServerSideProps as getServerSideProps } from '@gen3/frontend/pages/Discovery/data';

import { registerDiscoveryCustomCellRenderers } from '@/lib/Discovery/CustomCellRenderers';
import { registerDiscoveryStudyPreviewRenderers } from '@/lib/Discovery/CustomRowRenderers';

registerDiscoveryCustomCellRenderers();
registerDiscoveryStudyPreviewRenderers();

export default DiscoveryPage;

export { getServerSideProps };
