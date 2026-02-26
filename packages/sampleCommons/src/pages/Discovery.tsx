import DiscoveryPage from '@gen3/frontend/pages/Discovery/DiscoveryPage';
import { DiscoveryPageGetServerSideProps as getServerSideProps } from '@gen3/frontend/pages/Discovery/data';

import { registerDiscoveryCustomCellRenderers } from '@/lib/Discovery/CustomCellRenderers';
registerDiscoveryCustomCellRenderers();

export default DiscoveryPage;

export { getServerSideProps };
