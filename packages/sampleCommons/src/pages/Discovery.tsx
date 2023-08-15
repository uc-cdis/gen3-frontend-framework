import { default as DiscoveryPage } from '@gen3/frontend/pages/Discovery/Discovery';
import { registerDiscoveryCustomCellRenderers } from '@/lib/Discovery/CustomCellRenderers';
import { registerDiscoveryStudyPreviewRenderers } from '@/lib/Discovery/CustomRowRenderers';
export { getServerSideProps } from '@gen3/frontend/pages/Discovery/data';

registerDiscoveryCustomCellRenderers();
registerDiscoveryStudyPreviewRenderers();

export default DiscoveryPage;
