import { RenderFactoryTypedInstance } from '../../../../utils/RendererFactory';
import { TableDetailsPanelProps } from './types';
import TableDetailsPanel from './TableDetailsPanel';
import RowTableDetailsPanel from './RowTableDetailsPanel';

let instance: RenderFactoryTypedInstance<TableDetailsPanelProps>;

const DefaultRendererCatalog = {
  tableDetails: {
    default: TableDetailsPanel,
    rowDetails: RowTableDetailsPanel,
  },
};

const ExplorerTableDetailsPanelFactory =
  (): RenderFactoryTypedInstance<TableDetailsPanelProps> => {
    if (!instance) {
      instance = new RenderFactoryTypedInstance<TableDetailsPanelProps>();
    }
    return instance;
  };

export const registerCohortBuilderDefaultPreviewRenderers = () => {
  ExplorerTableDetailsPanelFactory().registerRendererCatalog(
    DefaultRendererCatalog,
  );
};

export default ExplorerTableDetailsPanelFactory;
