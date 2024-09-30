import { RenderFactoryTypedInstance } from '../../../utils/RendererFactory';
import { DiversityChart } from '../types';
import DefaultDetailsPanel from './DefaultDetailsPanel';

let instance: RenderFactoryTypedInstance<DiversityChart>;

const DefaultRendererCatalog = {
  details: {
    default: DefaultDetailsPanel,
  },
};

const DiversityChartsFactory =
  (): RenderFactoryTypedInstance<DiversityChart> => {
    if (!instance) {
      instance = new RenderFactoryTypedInstance<DiversityChart>();
      instance.registerRendererCatalog(DefaultRendererCatalog);
    }
    return instance;
  };

export default DiversityChartsFactory;
