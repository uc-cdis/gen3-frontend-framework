import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { create10ColorPallet, create10ColorAccessibleContrast } from './colors';

const main = () => {
  const {
    values: { themeFile, out },
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
      base: {
        type: 'string',
        short: 'b',
        default: '#E07C3E',
      },
      out: {
        type: 'string',
        short: 'o',
        default: '../',
      },
    },
  });

  if (!existsSync(themeFile)) {
    console.log("No themefile found. Please provide a themefile with '-t'.");
    return;
  }
  const themeData = readFileSync(themeFile, { encoding: 'utf8', flag: 'r' });
  const themeColors = JSON.parse(themeData);
  const primaryPallet = create10ColorPallet(themeColors.primary);
  const secondaryPallet = create10ColorPallet(themeColors.secondary);
  const accentPallet = create10ColorPallet(themeColors.accent);
  const basePallet = create10ColorPallet(themeColors.base);

  const theme = {
    primary: primaryPallet,
    'primary-contrast': create10ColorAccessibleContrast(primaryPallet),
    secondary: secondaryPallet,
    'secondary-contrast': create10ColorAccessibleContrast(secondaryPallet),
    accent: secondaryPallet,
    'accent-contrast': create10ColorAccessibleContrast(accentPallet),
    base: secondaryPallet,
    'base-contrast': create10ColorAccessibleContrast(basePallet),
  };

  writeFileSync(
    join(out ?? './', 'theme.json'),
    JSON.stringify(theme, null, 2),
  );
};

main();
