import { NavPageLayout, NavPageLayoutProps } from '../../features/Navigation';

import ColorTheme from '../../features/Theme/ColorTheme';

const ColorThemePage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerData={{
        title: 'Gen3 Theme Page',
        content: 'Theme page',
        key: 'gen3-theme-page',
      }}
    >
      <div className="flex justify-items-center w-full">
        <ColorTheme />
      </div>
    </NavPageLayout>
  );
};

export default ColorThemePage;
