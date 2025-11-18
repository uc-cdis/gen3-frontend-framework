export * from './components/Profile';
export * from './components/Login';

export * from './components/Modals';
export * from './components/MessageCards';
export * from './components/charts';
export * from './components/facets';
export * from './components/Protected';
// features
export * from './features/Navigation';
export * from './features/Discovery';
export * from './features/Dictionary';
export * from './features/Study';
export * from './features/CohortBuilder';
export * from './features/Query';
export * from './features/Workspace';
export * from './features/Analysis';
export * from './features/StaticNotebook';
export * from './features/Profile';
export * from './utils/';
export * from './types';

import { getNavPageLayoutPropsFromConfig } from './lib/common/staticProps';
import ContentSource from './lib/content';
import { type SessionConfiguration } from './lib/session/types';
import { type Fonts, type Gen3AppConfigData, type RegisteredIcons, } from './lib/content/types';
import ErrorCard from './components/MessageCards/ErrorCard';
import { registerCohortDiscoveryApp } from './features/CohortDiscovery/registerApp';
import { registerCohortSimilarityApp } from './features/CohortSimilarity/registerApp';
import { registerMetadataSchemaApp } from './features/Dictionary';
import { CollapsableSidebar } from './components/CollapsableSidebar';
import { DropdownWithIcon } from './components/DropdownWithIcon/DropdownWithIcon';
import {
  ActionButton,
  DownloadButton,
  DropdownButton,
  Gen3Button,
  Gen3ButtonReverse,
  JSONObjectDownloadButton,
  UploadJSONButton,
} from './components/Buttons';

import CountsValue from './components/counts/CountsValue';

import SegmentedControl from './components/SegmentedControl';

import TopBar from './features/Navigation/TopBar/TopBar';

import '@gen3/core'; // export Gen3 data UI standard pages
import Gen3Provider, { createMantineTheme, } from './components/Providers/Gen3Provider';
import DiscoveryPage from './pages/Discovery/Discovery';
import { DiscoveryPageGetServerSideProps } from './pages/Discovery/data';

import QueryPage from './pages/Query/Query';
import { QueryPageGetServerSideProps } from './pages/Query/data';

import LandingPage from './pages/Landing/Landing';
import { LandingPageGetServerSideProps } from './pages/Landing/data';

import ExplorerPage from './pages/Explorer/Explorer';
import {
  ExplorerPageGetServerSideProps,
  ExplorerPageGetServerSidePropsForConfigId,
  type ExplorerPageProps,
} from './pages/Explorer';

import ColorThemePage from './pages/Theme/Colors';
import { ColorThemePageGetServerSideProps } from './pages/Theme';

import ProfilePage, { ProfilePageGetServerSideProps } from './pages/Profile';
import LoginPage, { LoginPageGetServerSideProps } from './pages/Login';

import DictionaryPage, { DictionaryPageGetServerSideProps, } from './pages/DataDictionary';

import AuthzPage from './pages/admin/authz/Authz';
import { AdminAuthZPageGetServerSideProps } from './pages/admin/authz/data';

import Custom404Page from './pages/404/Custom404Page';

import SubmissionPage from './pages/Submission/Submission';
import { SubmissionPageGetServerSideProps } from './pages/Submission/data';

import WorkspacePage from './pages/Workspace/Workspace';
import { WorkspaceNoAccessPage } from './pages/Workspace/index';
import { WorkspaceNoAccessPageServerSideProps, WorkspacePageGetServerSideProps, } from './pages/Workspace/data';

import AnalysisPage from './pages/Analysis/Analysis';
import { AnalysisPageGetServerSideProps, type AnalysisPageLayoutProps, } from './pages/Analysis';

import AnalysisEditorPage from './pages/admin/analysis/Analysis';
import { AnalysisEditorPageGetServerSideProps } from './pages/admin/analysis/data';

import AiSearchPage from './pages/AiSearch/AiSearch';
import { AISearchPageGetServerSideProps } from './pages/AiSearch/data';

import NotebookLitePage from './pages/NotebookLite/NotebookLite';
import { NotebookLitePageGetStaticProps } from './pages/NotebookLite';

import DataLibraryPage, { DataLibraryPageGetServerSideProps, } from './pages/DataLibrary'; // TODO Replace with AppTool plugin
import CrosswalkPage from './pages/Crosswalk';
import { CrosswalkPageGetServerSideProps } from './pages/Crosswalk/data';

import TabbedCohortBuilderPage from './pages/TabbedCohortBuilder';
import { TabbedCohortBuilderPageGetServerSideProps } from './pages/TabbedCohortBuilder/data';

import RepositoryPage, { RepositoryPageGetServerSideProps, } from './pages/Repository';

import { TailwindConfig } from './utils/tailwindConfig';

import sessionToken from './api/auth/sessionToken';
import sessionLogout from './api/auth/sessionLogout';
import credentialsLogin from './api/auth/credentialsLogin';
import credentialsLogout from './api/auth/credentialsLogout';
import analysisApiCohortDiscovery from './features/CohortDiscovery/api/analysisApiCohortDiscovery';
import { type QueryPageLayoutProps, type QueryProps } from './pages/Query';

export {
  ContentSource,
  type Fonts,
  type RegisteredIcons,
  type SessionConfiguration,
  type ExplorerPageProps,
  type AnalysisPageLayoutProps,
  // components
  CollapsableSidebar,
  DownloadButton,
  JSONObjectDownloadButton,
  DropdownButton,
  DropdownWithIcon,
  SegmentedControl,
  Gen3Button,
  Gen3ButtonReverse,
  UploadJSONButton,
  ActionButton,
  ErrorCard,
  TopBar,
  CountsValue,
  // Pages
  type QueryProps,
  type QueryPageLayoutProps,
  type Gen3AppConfigData,
  DiscoveryPage,
  DiscoveryPageGetServerSideProps,
  QueryPage,
  QueryPageGetServerSideProps,
  LandingPage,
  LandingPageGetServerSideProps,
  ColorThemePage,
  ColorThemePageGetServerSideProps,
  DictionaryPage,
  DictionaryPageGetServerSideProps,
  ExplorerPage,
  ExplorerPageGetServerSideProps,
  ExplorerPageGetServerSidePropsForConfigId,
  ProfilePage,
  ProfilePageGetServerSideProps,
  LoginPage,
  LoginPageGetServerSideProps,
  TailwindConfig,
  Gen3Provider,
  getNavPageLayoutPropsFromConfig,
  AuthzPage,
  AdminAuthZPageGetServerSideProps,
  WorkspacePage,
  WorkspacePageGetServerSideProps,
  WorkspaceNoAccessPage,
  WorkspaceNoAccessPageServerSideProps,
  AnalysisPage,
  AnalysisPageGetServerSideProps,
  Custom404Page,
  sessionToken,
  sessionLogout,
  credentialsLogin,
  credentialsLogout,
  createMantineTheme,
  AiSearchPage,
  AISearchPageGetServerSideProps,
  CrosswalkPage,
  CrosswalkPageGetServerSideProps,
  SubmissionPage,
  SubmissionPageGetServerSideProps,
  DataLibraryPage,
  DataLibraryPageGetServerSideProps,
  NotebookLitePage,
  NotebookLitePageGetStaticProps,
  registerMetadataSchemaApp,
  AnalysisEditorPage,
  AnalysisEditorPageGetServerSideProps,
  TabbedCohortBuilderPage,
  TabbedCohortBuilderPageGetServerSideProps,
  RepositoryPage,
  RepositoryPageGetServerSideProps,
  // apps
  registerCohortDiscoveryApp,
  registerCohortSimilarityApp,
  // appApis
  analysisApiCohortDiscovery,
};
