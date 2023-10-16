import React from 'react';
import { Divider, Text } from '@mantine/core';

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
  'accent-warm-contrast': [
    'text-accent-warm-contrast-max',
    'text-accent-warm-contrast-lightest',
    'text-accent-warm-contrast-lighter',
    'text-accent-warm-contrast-light',
    'text-accent-warm-contrast',
    'text-accent-warm-contrast-vivid',
    'text-accent-warm-contrast-dark',
    'text-accent-warm-contrast-darker',
    'text-accent-warm-contrast-darkest',
    'text-accent-warm-contrast-min',
  ],
  'accent-cool-contrast': [
    'text-accent-cool-contrast-max',
    'text-accent-cool-contrast-lightest',
    'text-accent-cool-contrast-lighter',
    'text-accent-cool-contrast-light',
    'text-accent-cool-contrast',
    'text-accent-cool-contrast-vivid',
    'text-accent-cool-contrast-dark',
    'text-accent-cool-contrast-darker',
    'text-accent-cool-contrast-darkest',
    'text-accent-cool-contrast-min',
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
    'bg-base-dark',
    'bg-base-darker',
    'bg-base-darkest',
    'bg-base-ink',
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

  'accent-warm': [
    'bg-accent-warm-max',
    'bg-accent-warm-lightest',
    'bg-accent-warm-lighter',
    'bg-accent-warm-light',
    'bg-accent-warm',
    'bg-accent-warm-vivid',
    'bg-accent-warm-dark',
    'bg-accent-warm-darker',
    'bg-accent-warm-darkest',
    'bg-accent-warm-min',
  ],
  'accent-cool': [
    'bg-accent-cool-max',
    'bg-accent-cool-lightest',
    'bg-accent-cool-lighter',
    'bg-accent-cool-light',
    'bg-accent-cool',
    'bg-accent-cool-vivid',
    'bg-accent-cool-dark',
    'bg-accent-cool-darker',
    'bg-accent-cool-darkest',
    'bg-accent-cool-min',
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

interface ColorStylePalletProps {
  readonly name: string;
  readonly colors: ReadonlyArray<string>;
}

interface ColorAndContrastStylePalletProps extends ColorStylePalletProps {
  readonly contrast?: ReadonlyArray<string>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ColorPalletLine = ({ name, colors }: ColorStylePalletProps) => {
  return (
    <div className="flex flex-row items-center font-montserrat">
      <div className="grid gap-12 grid-cols-11 grid-rows-1 my-1">
        <p className="col-span-3 font-medium w-24">{name}</p>
        {colors.map((x, i) => (
          <div key={`${x}-${i}`} className={`${x} p-4 px-8 mx-2 rounded`} />
        ))}
      </div>
    </div>
  );
};

const ColorAndContrastPalletLine = ({
  name,
  colors,
  contrast = undefined,
}: ColorAndContrastStylePalletProps) => {
  return (
    <div>
      <div className="grid gap-2 grid-cols-12 grid-rows-1 my-1">
        <p className="bg-base-max col-span-2 text-black ">{name}</p>
        {colors.map((x, i) => {
          const ext = x.split('-').slice(-1);
          return (
            <div
              key={`${x}-${i}`}
              className={`${x} ${
                contrast?.[i] ?? ''
              } flex justify-center p-4 px-8 mx-2 rounded border text-sm border-black`}
            >
              {ext}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ColorTheme = () => {
  return (
    <article className="prose font-montserrat bg-base-max text-base-contrast-lighter md:prose-md min-w-full m-4">
      <p className="prose font-semibold text-2xl">Color Palettes</p>
      <div className="flex flex-col">
        <div>
          The following theme colors are are currently available in this Gen3
          Data Commons.
        </div>
        {Object.keys(Gen3FrontEndColors).map((name: string) => {
          return (
            <ColorAndContrastPalletLine
              key={`${name}-pallet`}
              name={name}
              colors={Gen3FrontEndColors[name]}
              contrast={
                Object.keys(Gen3FrontendContrastColors).filter((element) =>
                  element.includes(name),
                ).length > 0
                  ? Gen3FrontendContrastColors[`${name}-contrast`]
                  : Gen3FrontendContrastColors['primary-contrast']
              }
            />
          );
        })}
        <Text>
          <p>
            <b>Gen3 Color Theme is based on USWDS theme color tokens</b> which
            are divided into several high-level role-based color families:{' '}
            <em>
              base, primary, secondary, accent, accent-warm, accent-cool, chart,
              and utility.
            </em>
          </p>
          <b>Base</b> is a project’s neutral color, typically some tint of gray,
          and usually used as the text color throughout.
          <p>
            <b>Primary, secondary, and accent colors</b> can be thought of as
            falling into a proportional 60/30/10 relationship: about 60% of your
            site’s color would be the primary color family, about 30% would be
            the secondary color family, and about 10% would be the accent color
            families (accent-warm and accent-cool). Note that these proportions
            are for non-base colors. In many cases, the neutral base text color
            will be the predominant tone on your site.
          </p>
          <p>
            Each color in the theme has 10 colors:
            <b>
              max, lightest, lighter, light, DEFAULT, vivid, dark, darker,
              darkest, min{' '}
            </b>
            These are padded to 10 color arrays for compatibility with
            Mantine&amp.s color theme. This allows you to pass
            color=&quot;primary|secondary|accent....&quot; to Mantine components
            as documented, this includes accessing lighter or darker version vis
            the primary.N (where N 0..9).
          </p>
          Each of these color also has two contrasting colors:
          <ul>
            <li>
              <b>
                content-max, content-lightest, content-lighter, content-light,
                content-DEFAULT, content-vivid, content-dark, content-darker,
                content-darkest, content-min{' '}
              </b>
            </li>
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
            are defined correctly. The <em>content</em> variant allows finder
            control over the theme but at the risk of creating 508 contrast
            errors Any component using <em>content</em> should be checked for
            508 contrast issues.
          </p>
        </Text>
      </div>
    </article>
  );
};

export default ColorTheme;
