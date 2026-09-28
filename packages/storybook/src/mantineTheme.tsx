import { createTheme, mergeThemeOverrides } from '@mantine/core';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import type { TenStringArray } from '@gen3/frontend/app';
import { createMantineTheme } from '@gen3/frontend/app';

const allThemeColors = import.meta.glob(
  '../../sampleCommons/config/*/themeColors.json',
  { eager: true, import: 'default' },
);
const themeColors: Record<string, TenStringArray> =
  (allThemeColors[
    `../../sampleCommons/config/${GEN3_COMMONS_NAME}/themeColors.json`
  ] as Record<string, TenStringArray>) ?? {};

const gen3Theme = createMantineTheme(
  {
    heading: ['Poppins', 'sans-serif'],
    content: ['Poppins', 'sans-serif'],
    fontFamily: 'Poppins',
  },
  themeColors,
);

const localTheme = createTheme({
  components: {/*Add components overrides here},*/},
  breakpoints: {
    xs: '30em',
    sm: '48em',
    md: '64em',
    lg: '74em',
    xl: '90em',
  },
});

export default mergeThemeOverrides(gen3Theme, localTheme);
