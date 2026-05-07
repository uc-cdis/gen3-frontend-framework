/** @type {import('tailwindcss').Config} */
/* eslint-disable @typescript-eslint/no-var-requires */
const { GEN3_COMMONS_NAME } = require('@gen3/core');
const plugin = require('tailwindcss/plugin');
const themeColors = require(
  `./../sampleCommons/config/${GEN3_COMMONS_NAME}/themeColors.json`,
);
const themeFonts = require(
  `./../sampleCommons/config/${GEN3_COMMONS_NAME}/themeFonts.json`,
);

module.exports = {
  // important: '#__next', // Uncommenting this affects tailwind styling in Modals
  content: [
    './../frontend/src/pages/**/*.{js,ts,jsx,tsx}',
    './../frontend/src/components/**/*.{js,ts,jsx,tsx}',
    './../frontend/src/features/**/*.{js,ts,jsx,tsx}',

    './../workspaces/src/pages/**/*.{js,ts,jsx,tsx}',
    './../workspaces/src/components/**/*.{js,ts,jsx,tsx}',
    './../workspaces/src/features/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        footer: '#373A3C',
        ...themeColors,
      },
      fontFamily: {
        heading: themeFonts.heading,
        content: themeFonts.content,
      },
      fontSize: {
        xxxs: '0.4rem',
        xxs: '0.5rem',
        tiny: '0.625rem',
      },
      borderWidth: {
        DEFAULT: '1px',
        0: '0',
        1: '1px',
        2: '2px',
        3: '3px',
        4: '4px',
        6: '6px',
        8: '8px',
      },
      height: {
        '100px': '100px',
        '200px': '200px',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    plugin(function ({ addVariant }) {
      // add mantine.dev variants
      addVariant('api-checked', '&[api-checked]');
      addVariant('api-active', '&[api-active]');
      addVariant('api-selected', '&[api-selected]');
      addVariant('api-hovered', '&[api-hovered]');
      addVariant('api-disabled', '&[api-disabled]');
      addVariant('api-in-range', '&[api-in-range]');
      addVariant('api-first-in-range', '&[api-first-in-range]');
      addVariant('api-last-in-range', '&[api-last-in-range]');
      addVariant('data-checked', '&[data-checked]');
      addVariant('data-active', '&[data-active]');
      addVariant('data-selected', '&[data-selected]');
      addVariant('data-hovered', '&[data-hovered]');
      addVariant('data-disabled', '&[data-disabled]');
      addVariant('data-in-range', '&[data-in-range]');
      addVariant('data-first-in-range', '&[data-first-in-range]');
      addVariant('data-last-in-range', '&[data-last-in-range]');
      addVariant('data-with-icon', '&[data-with-icon]');
    }),
    plugin(function ({ addUtilities }) {
      const newUtilities = {
        '.nextImageFillFix': {
          width: 'auto !important',
          right: 'auto !important',
          'min-width': '0 !important',
        },
      };
      addUtilities(newUtilities);
    }),
    plugin(function ({ addComponents }) {
      // TODO remove these
      addComponents({
        '.heal-btn': {
          display: 'inline-block',
          textAlign: 'center',
          padding: '0.375rem 1rem',
          fontSize: '1rem',
          lineHeight: '1.5',
          fontWeight: '600',
          textTransform: 'uppercase',
          color: '#ffffff',
          border: '4px solid transparent',
          borderRadius: '7px',
          backgroundColor: '#982568',
          '&:hover, &:focus': {
            backgroundColor: '#ffffff',
            borderColor: '#982568',
            color: '#982568',
          },
        },
        '.heal-btn-purple': {
          backgroundColor: '#532565',
          '&:hover, &:focus': {
            color: '#532565',
            borderColor: '#532565',
            backgroundColor: '#ffffff',
          },
        },
        '.heal-btn-rev': {
          color: '#982568',
          borderColor: '#982568',
          backgroundColor: '#ffffff',
          '&:hover, &:focus': {
            backgroundColor: '#982568',
            borderColor: 'transparent',
            color: '#ffffff',
          },
        },
        '.heal-link-footer': {
          color: '#FFFFFF',
          '&:hover, &:focus': {
            color: '#c0b3c5',
          },
        },
      });
    }),
  ],
  // Add any colors. fontSize, height used in a json config file here
  safelist: [
    'accentWarm',
    'text-tiny',
    'text-xxs',
    'text-xxxs',
    'h-20',
    {
      pattern:
        /bg-(primary|secondary|accent|accentWarm|accentCool|base)-(min|lightest|lighter|light|dark|darker|darkest|max)/,
    },
    {
      pattern:
        /text-(primary|secondary|accent|accentWarm|accentCool|base)-(min|lightest|lighter|light|dark|darker|darkest|max)/,
    },
    {
      pattern:
        /border-(primary|secondary|accent|accentWarm|accentCool|base)-(min|lightest|lighter|light|dark|darker|darkest|max)/,
    },
    {
      pattern: /bg-(primary|secondary|accent|accentWarm|accentCool|base)/,
    },
    {
      pattern: /text-(primary|secondary|accent|accentWarm|accentCool|base)/,
    },
    {
      pattern: /border-(primary|secondary|accent|accentWarm|accentCool|base)/,
    },
  ],
};
