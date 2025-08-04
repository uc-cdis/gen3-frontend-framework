import {
  DataTypeConfigWithManifest,
  DownloadButtonConfig,
  DropdownsWithButtonsProps,
  TabsConfig,
} from '../types';
import { SummaryTable } from '../ExplorerTable/types';
import { Gen3AppConfigData } from '../../../lib/content/types';

export interface RepositoryConfiguration extends Gen3AppConfigData {
  filters?: TabsConfig; // filters for the fields
  guppyConfig: DataTypeConfigWithManifest; // guppy
  table?: SummaryTable; // table configuration
  dropdowns?: Record<string, DropdownsWithButtonsProps>; // dropdown menu of action buttons
  buttons?: ReadonlyArray<DownloadButtonConfig>; // row of action buttons
  loginForDownload?: boolean; // login required for download
}
