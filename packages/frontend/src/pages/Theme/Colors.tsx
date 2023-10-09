import { NavPageLayout, NavPageLayoutProps } from '../../features/Navigation';

import ColorTheme from '../../features/Theme/ColorTheme';

const ColorThemePage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <ColorTheme />
    </NavPageLayout>
  );
};

export default ColorThemePage;
