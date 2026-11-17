import {
  DiscoveryConfigPage,
  DiscoveryConfigPageGetServerSideProps as getServerSideProps,
} from '@gen3/frontend';

import { registerDiscoveryCustomCellRenderers } from '@/lib/Discovery/CustomCellRenderers';
// register commons-specific renderers so the preview and the contentType suggestions match the real Discovery page
registerDiscoveryCustomCellRenderers();

export default DiscoveryConfigPage;

export { getServerSideProps };
