import { createTheme, mergeThemeOverrides } from '@mantine/core';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import { createMantineTheme, TenStringArray } from '@gen3/frontend/app';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const themeColors: Record<string, TenStringArray> = require(
  `../../sampleCommons/config/${GEN3_COMMONS_NAME}/themeColors.json`,
);

const gen3Theme = createMantineTheme(
  {
    heading: ['Poppins', 'sans-serif'],
    content: ['Poppins', 'sans-serif'],
    fontFamily: 'Poppins',
  },
  themeColors,
);

const localTheme = createTheme({
  components: {
    /*Add components overrides here},*/
  },
  breakpoints: {
    xs: '30em',
    sm: '48em',
    md: '64em',
    lg: '74em',
    xl: '90em',
  },
});

export default mergeThemeOverrides(gen3Theme, localTheme);
