/* eslint-disable @typescript-eslint/no-var-requires */

const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        'heal': {
          primary: '#99286B',
          secondary: '#402264',
          light_purple: '#F6EFF1',
          purple: '#532565',
          magenta: '#982568',
          red: '#981F32',
          coral: '#BF362E',
          orange: '#E07C3E',
          dark_gray: '#373A3C',
          medium_gray: '#818A91',
          light_gray: '#DDDDDD',
          blue: '#0044B3'
        },
        'midrc' : {
          secondary: '#421C52'
        },
        'gen3': {
          base_blue: '#3283C8',
          base_blue_light: '#05B8EE',
          lime: '#7EC500',
          iris: '#AD91FF',
          rose: '#E74C3C',
          bee: '#F4B940',
          pink: '#FF7ABC',
          highlight_orange: '#EF8523',
          highlight_orange_light: '#FF9635',
          mint: '#26D9B1',
          coal: '#4A4A4A',
          cloud: '#F5F5F5',
          gray: '#606060',
          lightgray: '#9B9B9B',
          smoke: '#D1D1D1',
          silver: '#E7E7E7',
          black: '#000000',
          white: '#FFFFFF',
          titanium: '#707070',
          obsidian: '#757575',
        },
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        sans: ['Source Sans Pro', 'sans-serif'],
      },
      fontSize: {
        tiny: '0.625rem'
      },
      borderWidth: {
        DEFAULT: '1px',
        '0': '0',
        '1': '1px',
        '2': '2px',
        '3': '3px',
        '4': '4px',
        '6': '6px',
        '8': '8px',
      },
    },

  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
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
    plugin(function({ addComponents }) {
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
            backgroundColor: '#ffffff'
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
            color: '#c0b3c5'
          },
        },
      });
    })
  ],
};
