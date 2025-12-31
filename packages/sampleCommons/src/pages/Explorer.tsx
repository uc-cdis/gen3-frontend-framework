import ExplorerPage from '@gen3/frontend/pages/Explorer';
import { ExplorerPageGetServerSideProps as getServerSideProps } from '@gen3/frontend/pages/Explorer/data';

import { registerCohortTableCustomCellRenderers } from '@/lib/CohortBuilder/CustomCellRenderers';
import { registerCustomExplorerDetailsPanels } from '@/lib/CohortBuilder/FileDetailsPanel';

registerCohortTableCustomCellRenderers();
registerCustomExplorerDetailsPanels();

export default ExplorerPage;

export { getServerSideProps };
