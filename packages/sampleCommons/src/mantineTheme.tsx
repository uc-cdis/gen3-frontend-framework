// import { createTheme, mergeThemeOverrides } from '@mantine/core';
//
// import {
//   createCSSVariables,
//   createMantineTheme,
//   TenStringArray,
// } from '@gen3/frontend/app';
//
// export const GEN3_COMMONS_NAME =
//   process.env.NEXT_PUBLIC_GEN3_COMMONS_NAME || 'gen3';
//
// // eslint-disable-next-line @typescript-eslint/no-require-imports
// const themeColors: Record<string, TenStringArray> = require(
//   `../config/${GEN3_COMMONS_NAME}/themeColors.json`,
// );
//
// const gen3Theme = createMantineTheme(
//   {
//     heading: ['Poppins', 'sans-serif'],
//     content: ['Poppins', 'sans-serif'],
//     fontFamily: 'Poppins',
//   },
//   themeColors,
// );
// const localTheme = createTheme({
//   components: {
//     /*Add components overrides here},*/
//   },
// });
//
// export const registerCSSVariables = () => {
//   createCSSVariables(themeColors);
// };
//
// export default mergeThemeOverrides(gen3Theme, localTheme);
