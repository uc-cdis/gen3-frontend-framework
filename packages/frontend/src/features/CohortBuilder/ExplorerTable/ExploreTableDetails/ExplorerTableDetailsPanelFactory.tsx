import { RenderFactoryTypedInstance } from '../../../../utils/RendererFactory';
import { TableDetailsPanelProps } from './types';
import QueryRowDetailsPanel from './QueryRowDetailsPanel';
import RowTableDetailsPanel from './RowTableDetailsPanel';

let instance: RenderFactoryTypedInstance<TableDetailsPanelProps>;

const DefaultRendererCatalog = {
  tableDetails: {
    default: RowTableDetailsPanel,
    queryRowDetails: QueryRowDetailsPanel,
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
