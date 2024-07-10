import { NavPageLayoutProps } from '../../features/Navigation';
import { type CrosswalkConfig } from '../../features/Crosswalk';

export interface CrosswalkPageLayoutProps extends NavPageLayoutProps {
  config: CrosswalkConfig;
}
