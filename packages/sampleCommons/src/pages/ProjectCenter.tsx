import ProjectCenterPage from '@gen3/frontend/pages/ProjectCenter/ProjectCenterPage';
import { ProjectCenterPageGetServerSideProps as getServerSideProps } from '@gen3/frontend/pages/ProjectCenter/data';

import { registerDiscoveryCustomCellRenderers } from '@/lib/Discovery/CustomCellRenderers';
registerDiscoveryCustomCellRenderers();

export default ProjectCenterPage;

export { getServerSideProps };
