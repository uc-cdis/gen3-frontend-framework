export const TabsLayoutToComponentProp = (
  tabsLayout?: 'left' | 'right' | 'center',
) => {
  if (!tabsLayout) {
    return 'flex-start';
  }
  switch (tabsLayout) {
    case 'left': {
      return 'flex-start';
    }
    case 'right': {
      return 'flex-end';
    }
    case 'center': {
      return 'center';
    }
    default: {
      return 'flex-start';
    }
  }
};
