import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { create10ColorPallet, create10ColorAccessibleContrast } from './colors';

const utility = {
  link: '#155276',
  success: '#318f71',
  warning: '#d9a214',
  error: '#8a0e2a',
  emergency: '#6a0019',
  info: '#1c5e86',
  category1: '#1c5e86',
  category2: '#d1541d',
  category3: '#564990',
  category4: '#4dbc97',
};

const utilityContrast = {
  link: '#f1f1f1',
  success: '#000000',
  warning: '#1b1b1b',
  error: '#f1f1f1',
  emergency: '#f1f1f1',
  info: '#f1f1f1',
  category1: '#f1f1f1',
  category2: '#000000',
  category3: '#f1f1f1',
  category4: '#1b1b1b',
};

const main = () => {
  const {
    values: { themeFile, out, colorShift, colorSaturation },
  } = parseArgs({
    options: {
      themeFile: {
        type: 'string',
        short: 't',
        default: './colors.json',
      },
      primary: {
        type: 'string',
        short: 'p',
        default: '#532565',
      },
      secondary: {
        type: 'string',
        short: 's',
        default: '#982568',
      },
      accent: {
        type: 'string',
        short: 'a',
        default: '#E07C3E',
      },
      accentWarm: {
        type: 'string',
        default: '#E07C3E',
      },
      accentCool: {
        type: 'string',
        default: '#1552e0',
      },
      base: {
        type: 'string',
        short: 'b',
        default: '#858585',
      },
      table: {
        type: 'string',
        default: '#858585',
      },
      navigation: {
        type: 'string',
        default: '#eaeaea',
      },
      out: {
        type: 'string',
        short: 'o',
        default: '../',
      },
      colorShift: {
        type: 'string',
        default: '90',
      },
      colorSaturation: {
        type: 'string',
        default: '20',
      },
    },
  });

  const shift = Number(colorShift);
  const saturation = Number(colorSaturation);

  if (!themeFile) {
    console.error(
      "No theme file found. Please provide a theme file with '-t'.",
    );
    return;
  }

  if (themeFile && !existsSync(themeFile)) {
    console.log("No theme file found. Please provide a theme file with '-t'.");
    return;
  }
  const themeData = readFileSync(themeFile, { encoding: 'utf8', flag: 'r' });
  const themeColors = JSON.parse(themeData);
  const primaryPallet = create10ColorPallet(
    themeColors.primary,
    shift,
    saturation,
  );
  const secondaryPallet = create10ColorPallet(
    themeColors.secondary,
    shift,
    saturation,
  );
  const accentPallet = create10ColorPallet(
    themeColors.accent,
    shift,
    saturation,
  );
  const accentPalletWarm = create10ColorPallet(
    themeColors.accentWarm,
    shift,
    saturation,
  );
  const accentPalletCool = create10ColorPallet(
    themeColors.accentCool,
    shift,
    saturation,
  );
  const basePallet = create10ColorPallet(themeColors.base, shift, saturation);
  const chartPallet = create10ColorPallet(themeColors.chart, shift, saturation);
  const tablePallet = create10ColorPallet(
    themeColors?.table ?? '#ffffff',
    shift,
    saturation,
  );
  const navigationPallet = create10ColorPallet(
    themeColors?.navigation ?? '#ffffff',
    shift,
    saturation,
  );
  const theme = {
    primary: primaryPallet,
    'primary-contrast': create10ColorAccessibleContrast(primaryPallet),
    secondary: secondaryPallet,
    'secondary-contrast': create10ColorAccessibleContrast(secondaryPallet),
    accent: accentPallet,
    'accent-contrast': create10ColorAccessibleContrast(accentPallet),
    'accent-warm': accentPalletWarm,
    'accent-warm-contrast': create10ColorAccessibleContrast(accentPalletWarm),
    'accent-cool': accentPalletCool,
    'accent-cool-contrast': create10ColorAccessibleContrast(accentPalletCool),
    base: basePallet,
    'base-contrast': create10ColorAccessibleContrast(basePallet),
    utility: utility,
    'utility-contrast': utilityContrast,
    chart: chartPallet,
    'chart-contrast': create10ColorAccessibleContrast(chartPallet),
    table: tablePallet,
    'table-contrast': create10ColorAccessibleContrast(tablePallet),
    navigation: navigationPallet,
    'navigation-contrast': create10ColorAccessibleContrast(navigationPallet),
  };

  writeFileSync(
    join(out ?? './', 'themeColors.json'),
    JSON.stringify(theme, null, 2),
  );
};

main();
