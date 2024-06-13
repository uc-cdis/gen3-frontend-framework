import { RenderFactoryTypedInstance } from '../../../../utils/RendererFactory';
import { TableDetailsPanelProps } from './types';
import TableDetailsPanel from './TableDetailsPanel';

let instance: RenderFactoryTypedInstance<TableDetailsPanelProps>;

const DefaultRendererCatalog = {
  tableDetails: {
    default: TableDetailsPanel,
  },
};

const TableDetailsPanelFactory =
  (): RenderFactoryTypedInstance<TableDetailsPanelProps> => {
    if (!instance) {
      instance = new RenderFactoryTypedInstance<TableDetailsPanelProps>();
    }
    return instance;
  };

export const registerCohortBuilderDefaultPreviewRenderers = () => {
  TableDetailsPanelFactory().registerRendererCatalog(DefaultRendererCatalog);
};

export default TableDetailsPanelFactory;
