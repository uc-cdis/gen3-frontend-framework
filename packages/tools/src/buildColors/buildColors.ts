import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { create10ColorAccessibleContrast, create10ColorPallet } from './colors';

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
    console.log("No theme file found. Please provide a theme file with '-t'.");
    return;
  }

  if (themeFile && !existsSync(themeFile)) {
    console.log("No theme file found. Please provide a theme file with '-t'.");
    return;
  }
  const themeData = readFileSync(themeFile, { encoding: 'utf8', flag: 'r' });
  const themeColors = JSON.parse(themeData);

  // build a list of colors
  const theme = Object.entries(themeColors).reduce(
    (acc: Record<string, Record<string, string>>, [colorName, colorValue]) => {
      acc[colorName] = create10ColorPallet(
        colorValue as string,
        shift,
        saturation,
      );

      acc[`${colorName}-contrast`] = create10ColorAccessibleContrast(
        acc[colorName],
      );

      return acc;
    },
    {},
  );

  theme['utility'] = utility;
  theme['utility-contrast'] = utilityContrast;

  writeFileSync(
    join(out ?? './', 'themeColors.json'),
    JSON.stringify(theme, null, 2),
  );
};

main();
