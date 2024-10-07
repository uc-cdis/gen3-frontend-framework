import { promises as fs } from 'fs';
import path from 'path';
import { importDirectory } from '@iconify/tools/lib/import/directory';
import { cleanupSVG } from '@iconify/tools/lib/svg/cleanup';
import { runSVGO } from '@iconify/tools/lib/optimise/svgo';
import { isEmptyColor, parseColors } from '@iconify/tools/lib/colors/parse';
import { getSubdirectories } from './utils';
import { IconSet } from '@iconify/tools';

interface Args extends Record<string, string | boolean> {
  inpath: string;
  outpath: string;
  prefix: string;
}

const getArgs = (defaults: Args): Args => {
  const args: Args = defaults;
  process.argv.slice(2, process.argv.length).forEach((arg) => {
    // long arg
    if (arg.slice(0, 2) === '--') {
      const longArg = arg.split('=');
      const longArgFlag = longArg[0].slice(2, longArg[0].length);
      const longArgValue = longArg.length > 1 ? longArg[1] : true;
      args[longArgFlag] = longArgValue;
    }
    // flags
    else if (arg[0] === '-') {
      const flags = arg.slice(1, arg.length).split('');
      flags.forEach((flag) => {
        args[flag] = true;
      });
    }
  });
  return args;
};

const processIconSet = async (inpath: string, prefix: string) => {
  const iconSet = await importDirectory(inpath, {
    prefix: prefix,
    includeSubDirs: false,
  });

  // Validate, clean up, fix palette and optimise
  await iconSet.forEach(async (name, type) => {
    if (type !== 'icon') {
      return;
    }

    const svg = iconSet.toSVG(name);
    if (!svg) {
      // Invalid icon
      iconSet.remove(name);
      return;
    }

    // Clean up and optimise icons
    try {
      await cleanupSVG(svg);
      await parseColors(svg, {
        defaultColor: 'currentColor',
        callback: (attr, colorStr, color) => {
          return !color || isEmptyColor(color) ? colorStr : 'currentColor';
        },
      });
      await runSVGO(svg);
    } catch (err) {
      // Invalid icon
      console.error(`Error parsing ${name}:`, err);
      iconSet.remove(name);
      return;
    }

    // Update icon
    iconSet.fromSVG(name, svg);
  });
  return iconSet;
};

const build = async (inpath: string, outpath: string, prefix = 'gen3') => {
  // Import icons

  const subdirs = getSubdirectories(inpath);

  subdirs.forEach((setPrefix) => {
    processIconSet(path.join(inpath, setPrefix), setPrefix).then((iconSet) => {
      const exported = JSON.stringify(iconSet.export(), null, '\t') + '\n';
      // Save to file
      fs.writeFile(`${outpath}/${iconSet.prefix}.json`, exported, 'utf8');
    });
  });

  /* ----
  console.log('subDirs:build', subdirs);
  const iconSet = await importDirectory(inpath, {
    prefix: prefix,
    includeSubDirs: false,
  });

  // Validate, clean up, fix palette and optimise
  await iconSet.forEach(async (name, type) => {
    if (type !== 'icon') {
      return;
    }

    const svg = iconSet.toSVG(name);
    if (!svg) {
      // Invalid icon
      iconSet.remove(name);
      return;
    }

    // Clean up and optimise icons
    try {
      await cleanupSVG(svg);
      await parseColors(svg, {
        defaultColor: 'currentColor',
        callback: (attr, colorStr, color) => {
          return !color || isEmptyColor(color) ? colorStr : 'currentColor';
        },
      });
      await runSVGO(svg);
    } catch (err) {
      // Invalid icon
      console.error(`Error parsing ${name}:`, err);
      iconSet.remove(name);
      return;
    }

    // Update icon
    iconSet.fromSVG(name, svg);
  });
---*/
};

const { inpath, outpath, prefix } = getArgs({
  inpath: './',
  outpath: './',
  prefix: 'gen3',
});

const main = async () => {
  await build(inpath, outpath, prefix);
};
main();
