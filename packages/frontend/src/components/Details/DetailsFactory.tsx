import { RenderFactoryTypedInstance } from '../../utils/RendererFactory';
import { DetailsPanelComponentProps } from './types';
import DefaultDetailsPanel from './DefaultDetailsPanel';

let instance: RenderFactoryTypedInstance<DetailsPanelComponentProps>;

const DefaultRendererCatalog = {
  details: {
    default: DefaultDetailsPanel,
  },
};

const DetailsPanelFactory =
  (): RenderFactoryTypedInstance<DetailsPanelComponentProps> => {
    if (!instance) {
      instance = new RenderFactoryTypedInstance<DetailsPanelComponentProps>();
      instance.registerRendererCatalog(DefaultRendererCatalog);
    }
    return instance;
  };

export default DetailsPanelFactory;
