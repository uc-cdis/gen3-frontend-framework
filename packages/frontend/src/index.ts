export * from './features/Navigation';
export * from './features/Discovery';
export * from './components/Profile';
export * from './components/Login';
export * from './components/Modals';
export * from './components/charts';

export * from './features/CohortBuilder';
export * from './features/Query';
export * from './features/Workspace';
export * from './utils/';

import { getNavPageLayoutPropsFromConfig } from './lib/common/staticProps';
import ContentSource from './lib/content';
import { type SessionConfiguration } from './lib/session/types';
import { type Fonts, type RegisteredIcons } from './lib/content/types';
import ErrorCard from './components/ErrorCard';
import '@gen3/core';

// export Gen3 data UI standard pages
import Gen3Provider from './components/Providers/Gen3Provider';
import DiscoveryPage from './pages/Discovery/Discovery';
import { DiscoveryPageGetServerSideProps } from './pages/Discovery/data';

import QueryPage from './pages/Query/Query';
import { QueryPageGetServerSideProps } from './pages/Query/data';

import LandingPage from './pages/Landing/Landing';
import { LandingPageGetStaticProps } from './pages/Landing/data';

import ExplorerPage from './pages/Explorer/Explorer';
import { ExplorerPageGetServerSideProps } from './pages/Explorer/data';

import ColorThemePage from './pages/Theme/Colors';
import { ColorThemePageGetServerSideProps } from './pages/Theme';

import ProfilePage, { ProfilePageGetServerSideProps } from './pages/Profile';
import LoginPage, { LoginPageGetServerSideProps } from './pages/Login';

import DictionaryPage, {
  DictionaryPageGetServerSideProps,
} from './pages/DataDictionary';

import AuthzPage from './pages/admin/authz/Authz';
import { AdminAuthZPageGetServerSideProps } from './pages/admin/authz/data';

import Custom404Page from './pages/404/Custom404Page';

import SubmissionPage from './pages/Submission/Submission';
import { SubmissionPageGetServerSideProps } from './pages/Submission/data';

import WorkspacesPage from './pages/Workspace/Workspaces';
import { WorkspacesPageGetServerSideProps } from './pages/Workspace/data';

import AiSearchPage from './pages/AiSearch/AiSearch';
import { AISearchPageGetServerSideProps } from './pages/AiSearch/data';

// TODO Replace with AppTool plugin
import CrosswalkPage from './pages/Crosswalk';
import { CrosswalkPageGetServerSideProps } from './pages/Crosswalk/data';

import { TailwindConfig } from './utils/tailwindConfig';

import sessionToken from './api/auth/sessionToken';
import sessionLogout from './api/auth/sessionLogout';
import credentialsLogin from './api/auth/credentialsLogin';
import credentialsLogout from './api/auth/credentialsLogout';

export {
  ContentSource,
  type Fonts,
  type RegisteredIcons,
  type SessionConfiguration,
  ErrorCard,
  DiscoveryPage,
  DiscoveryPageGetServerSideProps,
  QueryPage,
  QueryPageGetServerSideProps,
  LandingPage,
  LandingPageGetStaticProps,
  ColorThemePage,
  ColorThemePageGetServerSideProps,
  DictionaryPage,
  DictionaryPageGetServerSideProps,
  ExplorerPage,
  ExplorerPageGetServerSideProps,
  ProfilePage,
  ProfilePageGetServerSideProps,
  LoginPage,
  LoginPageGetServerSideProps,
  TailwindConfig,
  Gen3Provider,
  getNavPageLayoutPropsFromConfig,
  AuthzPage,
  AdminAuthZPageGetServerSideProps,
  WorkspacesPage,
  WorkspacesPageGetServerSideProps,
  Custom404Page,
  sessionToken,
  sessionLogout,
  credentialsLogin,
  credentialsLogout,
  AiSearchPage,
  AISearchPageGetServerSideProps,
  CrosswalkPage,
  CrosswalkPageGetServerSideProps,
  SubmissionPage,
  SubmissionPageGetServerSideProps,
};
