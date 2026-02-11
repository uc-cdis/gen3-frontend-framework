import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { colorType, create10ColorAccessibleContrast, create10ColorPallet, } from './colors';

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
    values: { themeFile, out, colorShift, colorSaturation, vars },
  } = parseArgs({
    options: {
      themeFile: {
        type: 'string',
        short: 't',
        default: './colors.json',
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
      vars: {
        type: 'boolean',
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

  if (vars) {
    // vars only output
    const theme = [
      ...Object.keys(themeColors),
      'utility',
      'table',
      'navigation',
    ].reduce((acc: Record<string, string>, colorName) => {
      for (const [idx, value] of Object.entries(colorType.toReversed())) {
        const colorVar = `mantine-color-${colorName}-${idx}`;
        const contrastColorVar = `mantine-color-${colorName}-contrast-${idx}`;
        const colorVarName = `${colorName}${value !== 'DEFAULT' ? '-' + value : ''}`;
        const contrastColorVarName = `${colorName}-contrast${value !== 'DEFAULT' ? '-' + value : ''}`;
        acc[colorVarName] = `var(--${colorVar})`;
        acc[contrastColorVarName] = `var(--${contrastColorVar})`;
      }
      return acc;
    }, {});
    writeFileSync(
      join(out ?? './', 'themeColorCSSVars.json'),
      JSON.stringify(theme, null, 2),
    );
    return;
  }

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
