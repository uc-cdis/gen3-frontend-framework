export type { Fonts, RegisteredIcons } from '../lib/content/types';

export { registerMetadataSchemaApp } from '../features/Dictionary/metadata/registerApp';
export { registerCohortDiscoveryApp } from '../features/CohortDiscovery/registerApp';
export { registerExplorerDefaultCellRenderers } from '../features/CohortBuilder/ExplorerTable/ExplorerTableCellRenderers';
export { registerCohortBuilderDefaultPreviewRenderers } from '../features/CohortBuilder/ExplorerTable/ExploreTableDetails/ExplorerTableDetailsPanelFactory';
export { registerIGVApp } from '../features/genomic/igv/registerApp';
export { type TenStringArray } from '../utils/types';
export {
  createMantineTheme,
  createCSSVariables,
} from '../components/Providers/Gen3Provider';

import Gen3Provider from '../components/Providers/Gen3Provider';

export type { ModalsConfig } from '../components/Modals/types';
export type { SessionConfiguration } from '../lib/session/types';
export type { AuthorizedRoutesConfig } from '../lib/authz/type';
export { DefaultAuthorizedRoutesConfig } from '../lib/authz/type';
export { Gen3Provider };
