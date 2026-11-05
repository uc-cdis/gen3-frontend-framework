import WorkspaceNoAccessPage from './WorkspaceNoAccess.Page';
import WorkspaceRequestAccessPage from './WorkspaceRequestAccessPage';
import WorkspacePage from './WorkspacePage';
import {
  WorkspacePageGetServerSideProps,
  WorkspaceNoAccessPageServerSideProps,
} from './data';

import { type WorkspacePageLayoutProps } from './types';
import WorkspaceRequestForm from '../../features/Workspace/WorkspaceRequestAccess';
import { type RequestAccessFormProps } from '../../features/Workspace/types';

export {
  WorkspacePage,
  WorkspaceNoAccessPage,
  WorkspaceRequestAccessPage,
  WorkspacePageGetServerSideProps,
  WorkspaceNoAccessPageServerSideProps,
  WorkspaceRequestForm,
  type WorkspacePageLayoutProps,
  type RequestAccessFormProps,
};
