import {
  ExplorerPage,
  ExplorerPageGetServerSideProps as getServerSideProps,
  registerCohortBuilderDefaultPreviewRenderers,
  registerExplorerDefaultCellRenderers,
} from '@gen3/frontend';

import { registerCohortTableCustomCellRenderers } from '@/lib/CohortBuilder/CustomCellRenderers';
import { registerCustomExplorerDetailsPanels } from '@/lib/CohortBuilder/FileDetailsPanel';

registerExplorerDefaultCellRenderers();
registerCohortBuilderDefaultPreviewRenderers();
registerCohortTableCustomCellRenderers();
registerCustomExplorerDetailsPanels();

export default ExplorerPage;

export { getServerSideProps };
