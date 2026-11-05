import React, { useEffect, useRef, useState } from 'react';
import { Text } from '@mantine/core';

export const divider_style = {
  label: 'font-medium text-primary-content-darkest text-lg my-2',
};

const Gen3FrontendContrastColors: Record<string, ReadonlyArray<string>> = {
  'base-contrast': [
    'text-base-contrast-max',
    'text-base-contrast-lightest',
    'text-base-contrast-lighter',
    'text-base-contrast-light',
    'text-base-contrast',
    'text-base-contrast-vivid',
    'text-base-contrast-dark',
    'text-base-contrast-darker',
    'text-base-contrast-darkest',
    'text-base-contrast-min',
  ],
  'primary-contrast': [
    'text-primary-contrast-max',
    'text-primary-contrast-lightest',
    'text-primary-contrast-lighter',
    'text-primary-contrast-light',
    'text-primary-contrast',
    'text-primary-contrast-vivid',
    'text-primary-contrast-dark',
    'text-primary-contrast-darker',
    'text-primary-contrast-darkest',
    'text-primary-contrast-min',
  ],
  'secondary-contrast': [
    'text-secondary-contrast-max',
    'text-secondary-contrast-lightest',
    'text-secondary-contrast-lighter',
    'text-secondary-contrast-light',
    'text-secondary-contrast',
    'text-secondary-contrast-vivid',
    'text-secondary-contrast-dark',
    'text-secondary-contrast-darker',
    'text-secondary-contrast-darkest',
    'text-secondary-contrast-min',
  ],
  'accent-contrast': [
    'text-accent-contrast-max',
    'text-accent-contrast-lightest',
    'text-accent-contrast-lighter',
    'text-accent-contrast-light',
    'text-accent-contrast',
    'text-accent-contrast-vivid',
    'text-accent-contrast-dark',
    'text-accent-contrast-darker',
    'text-accent-contrast-darkest',
    'text-accent-contrast-min',
  ],
  'accentWarm-contrast': [
    'text-accentWarm-contrast-max',
    'text-accentWarm-contrast-lightest',
    'text-accentWarm-contrast-lighter',
    'text-accentWarm-contrast-light',
    'text-accentWarm-contrast',
    'text-accentWarm-contrast-vivid',
    'text-accentWarm-contrast-dark',
    'text-accentWarm-contrast-darker',
    'text-accentWarm-contrast-darkest',
    'text-accentWarm-contrast-min',
  ],
  'accentCool-contrast': [
    'text-accentCool-contrast-max',
    'text-accentCool-contrast-lightest',
    'text-accentCool-contrast-lighter',
    'text-accentCool-contrast-light',
    'text-accentCool-contrast',
    'text-accentCool-contrast-vivid',
    'text-accentCool-contrast-dark',
    'text-accentCool-contrast-darker',
    'text-accentCool-contrast-darkest',
    'text-accentCool-contrast-min',
  ],
  'chart-contrast': [
    'text-chart-contrast-max',
    'text-chart-contrast-lightest',
    'text-chart-contrast-lighter',
    'text-chart-contrast-light',
    'text-chart-contrast',
    'text-chart-contrast-vivid',
    'text-chart-contrast-dark',
    'text-chart-contrast-darker',
    'text-chart-contrast-darkest',
    'text-chart-contrast-min',
  ],
  'utility-contrast': [
    'text-utility-contrast-link',
    'text-utility-contrast-success',
    'text-utility-contrast-warning',
    'text-utility-contrast-error',
    'text-utility-contrast-emergency',
    'text-utility-contrast-info',
    'text-utility-contrast-category1',
    'text-utility-contrast-category2',
    'text-utility-contrast-category3',
    'text-utility-contrast-category4',
  ],
};

const Gen3FrontEndColors: Record<string, ReadonlyArray<string>> = {
  base: [
    'bg-base-max',
    'bg-base-lightest',
    'bg-base-lighter',
    'bg-base-light',
    'bg-base',
    'bg-base-vivid',
    'bg-base-dark',
    'bg-base-darker',
    'bg-base-darkest',
    'bg-base-min',
  ],
  primary: [
    'bg-primary-max',
    'bg-primary-lightest',
    'bg-primary-lighter',
    'bg-primary-light',
    'bg-primary',
    'bg-primary-vivid',
    'bg-primary-dark',
    'bg-primary-darker',
    'bg-primary-darkest',
    'bg-primary-min',
  ],

  secondary: [
    'bg-secondary-max',
    'bg-secondary-lightest',
    'bg-secondary-lighter',
    'bg-secondary-light',
    'bg-secondary',
    'bg-secondary-vivid',
    'bg-secondary-dark',
    'bg-secondary-darker',
    'bg-secondary-darkest',
    'bg-secondary-min',
  ],

  accent: [
    'bg-accent-max',
    'bg-accent-lightest',
    'bg-accent-lighter',
    'bg-accent-light',
    'bg-accent',
    'bg-accent-vivid',
    'bg-accent-dark',
    'bg-accent-darker',
    'bg-accent-darkest',
    'bg-accent-min',
  ],

  accentWarm: [
    'bg-accentWarm-max',
    'bg-accentWarm-lightest',
    'bg-accentWarm-lighter',
    'bg-accentWarm-light',
    'bg-accentWarm',
    'bg-accentWarm-vivid',
    'bg-accentWarm-dark',
    'bg-accentWarm-darker',
    'bg-accentWarm-darkest',
    'bg-accentWarm-min',
  ],
  accentCool: [
    'bg-accentCool-max',
    'bg-accentCool-lightest',
    'bg-accentCool-lighter',
    'bg-accentCool-light',
    'bg-accentCool',
    'bg-accentCool-vivid',
    'bg-accentCool-dark',
    'bg-accentCool-darker',
    'bg-accentCool-darkest',
    'bg-accentCool-min',
  ],

  chart: [
    'bg-chart-max',
    'bg-chart-lightest',
    'bg-chart-lighter',
    'bg-chart-light',
    'bg-chart',
    'bg-chart-vivid',
    'bg-chart-dark',
    'bg-chart-darker',
    'bg-chart-darkest',
    'bg-chart-min',
  ],
  utility: [
    'bg-utility-link',
    'bg-utility-success',
    'bg-utility-warning',
    'bg-utility-error',
    'bg-utility-emergency',
    'bg-utility-info',
    'bg-utility-category1',
    'bg-utility-category2',
    'bg-utility-category3',
    'bg-utility-category4',
  ],
};

const SHADE_NAMES: ReadonlyArray<string> = [
  'max',
  'lightest',
  'lighter',
  'light',
  'DEFAULT',
  'vivid',
  'dark',
  'darker',
  'darkest',
  'min',
];

const UTILITY_NAMES: ReadonlyArray<string> = [
  'link',
  'success',
  'warning',
  'error',
  'emergency',
  'info',
  'category1',
  'category2',
  'category3',
  'category4',
];

const COLOR_GROUPS: ReadonlyArray<{
  readonly title: string;
  readonly families: ReadonlyArray<string>;
}> = [
  { title: 'Background', families: ['base'] },
  { title: 'Brand', families: ['primary', 'secondary', 'accent'] },
  { title: 'Extra accents', families: ['accentWarm', 'accentCool', 'chart'] },
  { title: 'Utility', families: ['utility'] },
];

const FAMILY_DESCRIPTIONS: Record<string, string> = {
  base: 'Neutral tint used for page surfaces and body text.',
  primary: 'Main brand color: buttons, headings and key surfaces.',
  secondary: 'Quiet supporting surfaces and secondary buttons.',
  accent: 'Interactive emphasis: selected counts, tooltips, close buttons.',
  accentWarm: 'Warm highlight, used sparingly for status and percent bars.',
  accentCool: 'Cool highlight, used sparingly for status and highlights.',
  chart: 'Reserved for charts and data visualization series.',
  utility: 'Fixed-meaning colors for links, status messages and categories.',
};

const GRID =
  'grid grid-cols-[11rem_repeat(10,minmax(0,1fr))] gap-2 items-center';

const parseRgb = (value: string): [number, number, number] | undefined => {
  const match = value.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (!match) return undefined;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
};

const luminance = ([r, g, b]: [number, number, number]): number => {
  const [lr, lg, lb] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

const contrastRatio = (
  fg: [number, number, number],
  bg: [number, number, number],
): number => {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
};

interface SwatchProps {
  readonly bgClass: string;
  readonly textClass: string;
}

const Swatch = ({ bgClass, textClass }: SwatchProps) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [ratio, setRatio] = useState<number | undefined>(undefined);

  // check each contrast ratio
  useEffect(() => {
    if (!boxRef.current || !textRef.current) return;
    const bg = parseRgb(getComputedStyle(boxRef.current).backgroundColor);
    const fg = parseRgb(getComputedStyle(textRef.current).color);
    setRatio(bg && fg ? contrastRatio(fg, bg) : undefined);
  }, [bgClass, textClass]);

  const passes = ratio !== undefined && ratio >= 4.5;

  return (
    <div
      ref={boxRef}
      title={`${bgClass} + ${textClass}`}
      className={`${bgClass} h-14 rounded border border-base-light flex flex-col items-center justify-center text-xs`}
    >
      <span ref={textRef} className={`${textClass} font-semibold text-sm`}>
        Aa
      </span>
      {ratio !== undefined && (
        <span className={`${textClass} text-xs`}>
          {ratio.toFixed(1)}:1 {passes ? 'AA' : 'Fail'}
        </span>
      )}
    </div>
  );
};

interface ColorFamilyRowProps {
  readonly name: string;
  readonly colors: ReadonlyArray<string>;
  readonly contrast: ReadonlyArray<string>;
  readonly labels?: ReadonlyArray<string>;
}

const ColorFamilyRow = ({
  name,
  colors,
  contrast,
  labels,
}: ColorFamilyRowProps) => (
  <div className={GRID}>
    <div>
      <p className="m-0 font-medium text-primary">{name}</p>
      <p className="m-0 text-xs text-base-contrast">
        {FAMILY_DESCRIPTIONS[name]}
      </p>
    </div>
    {colors.map((bgClass, i) => (
      <div key={bgClass} className="flex flex-col gap-1">
        {labels && (
          <span className="text-xs text-base-contrast-lighter text-center truncate">
            {labels[i]}
          </span>
        )}
        <Swatch bgClass={bgClass} textClass={contrast[i] ?? ''} />
      </div>
    ))}
  </div>
);

const ShadeHeader = () => (
  <div
    className={`${GRID} sticky top-0 z-10 bg-base-max py-2 border-b border-base-light`}
  >
    <span />
    {SHADE_NAMES.map((shade) => (
      <span
        key={shade}
        className="text-xs font-medium text-center text-base-contrast-lighter"
      >
        {shade}
      </span>
    ))}
  </div>
);

const ColorTheme = () => {
  return (
    <article className="prose font-heading bg-base-max text-base-contrast-max md:prose-md m-4 min-w-full">
      <p className="prose font-semibold text-2xl">Color Palettes</p>
      <div className="flex flex-col mx-4">
        <div className="text-base-contrast-lighter mr-6">
          The following theme colors are currently available in this Gen3 Data
          Commons.
        </div>
        <ShadeHeader />
        {COLOR_GROUPS.map((group) => (
          <section key={group.title} className="mt-6 mr-6">
            <h3 className="m-0 mb-2 text-base font-semibold text-base-contrast">
              {group.title}
            </h3>
            <div className="flex flex-col gap-2">
              {group.families.map((name) => (
                <ColorFamilyRow
                  key={`${name}-pallet`}
                  name={name}
                  colors={Gen3FrontEndColors[name]}
                  contrast={Gen3FrontendContrastColors[`${name}-contrast`]}
                  labels={name === 'utility' ? UTILITY_NAMES : undefined}
                />
              ))}
            </div>
          </section>
        ))}
        <Text component="div" className="mr-6 mt-6 text-base-contrast-lighter">
          <p>
            <b>Gen3 Color Theme is based on USWDS theme color tokens</b> which
            are divided into several high-level role-based color families:{' '}
            <em>
              base, primary, secondary, accent, accentWarm, accentCool, chart,
              and utility.
            </em>
          </p>
          <b>Base</b> is a project’s background and border colors.
          <p>
            <b>Primary, secondary, and accent colors</b> can be thought of as
            falling into a proportional 60/30/10 relationship: about 60% of your
            site’s color would be the primary color family, about 30% would be
            the secondary color family, and about 10% would be the accent color
            families (accentWarm and accentCool). Note that these proportions
            are for non-base colors. In many cases, the neutral base text color
            will be the predominant tone on your site.
          </p>
          <p>
            Each color in the theme has 10 colors:
            <b>
              max, lightest, lighter, light, DEFAULT, vivid, dark, darker,
              darkest, min{' '}
            </b>
            These are padded to 10 color arrays for compatibility with Mantine's
            color theme. This allows you to pass
            color=&quot;primary|secondary|accent....&quot; to Mantine components
            as documented, this includes accessing lighter or darker version:
            primary.N (where N is 0 through 9).
          </p>
          Each of these color also has a contrasting color for text, which is:
          <ul>
            <li>
              <b>
                contrast-max, contrast-lightest, contrast-lighter,
                contrast-light, contrast-DEFAULT, contrast-vivid, contrast-dark,
                contrast-darker, contrast-darkest, contrast-min{' '}
              </b>
            </li>
          </ul>
          <p>
            The contrast color is defined to be a 508 compliant contrast so
            while <b>primary-darker</b> is a darker version of the primary
            color, <b>primary-contrast-darker</b> is a 508 contrast compliant
            color, and it actually lighter, but is named to match the primary
            color shade. This means that consistent use of color-<em>shade</em>{' '}
            and color-contrast-<em>shade</em>, for example{' '}
            <b>bg-primary-lighter</b> and <b>text-primary-contrast-lighter</b>{' '}
            ensures that these two colors will be 508 compliant if the shades
            are defined correctly. The <em>content</em> variant allows finer
            control over the theme but at the risk of creating 508 contrast
            errors. Any component using <em>content</em> should be checked for
            508 contrast issues.
          </p>
        </Text>
      </div>
    </article>
  );
};

export default ColorTheme;
