import ExplorerPage, {
  ExplorerPageGetServerSideProps as getServerSideProps,
} from '@gen3/frontend/pages/Explorer';

import { registerCohortTableCustomCellRenderers } from '@/lib/CohortBuilder/CustomCellRenderers';
import { registerCustomExplorerDetailsPanels } from '@/lib/CohortBuilder/FileDetailsPanel';

registerCohortTableCustomCellRenderers();
registerCustomExplorerDetailsPanels();

export default ExplorerPage;

export { getServerSideProps };
