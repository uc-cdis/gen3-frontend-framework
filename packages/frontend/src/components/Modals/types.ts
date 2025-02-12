import { TextContentProps } from '../Content/TextContent';

export interface BaseModalConfig {
  title?: string;
}

export interface FirstTimeModalConfig extends BaseModalConfig{
  enabled?: boolean;
  content: TextContentProps;
  scrollToEnableAccept?: boolean;
  showOnlyOnLogin?: boolean;
  expireDays?: number;
}

export interface SessionExpiredModalConfig extends BaseModalConfig{
  externalLoginUrl?: string;
}

export interface ModalsConfig {
  systemUseModal?: FirstTimeModalConfig;
  sessionExpiredModal?: SessionExpiredModalConfig;
}
