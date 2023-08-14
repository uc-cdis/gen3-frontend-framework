import { default as DiscoveryPage } from '@gen3/frontend/pages/Discovery/Discovery';
import { registerDiscoveryCustomCellRenderers } from '@/lib/Discovery/CustomCellRenderers';
export { getServerSideProps } from '@gen3/frontend/pages/Discovery/data';

registerDiscoveryCustomCellRenderers();


export default DiscoveryPage;
