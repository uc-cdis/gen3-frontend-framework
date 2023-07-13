import { FilesystemContent } from './filesystem';
import { ContentDatabase } from './ContentDatabase';
import { GEN3_FRONTEND_CONFIGURATION_ROOT } from './constants';

const ContentRoot = '';
//const ContentRoot = GEN3_FRONTEND_CONFIGURATION_ROOT;

const setup = () => {
  const config = { store: new FilesystemContent({ rootPath: ContentRoot }) };
  return new ContentDatabase(config);
};

const ContentSource = setup();

export default ContentSource;
