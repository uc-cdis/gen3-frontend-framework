const mdx = require('@mdx-js/mdx')
const plugin = require('tailwindcss/plugin');
const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors : {
          "heal" : {
              primary: "#99286B",
              secondary: "#402264"
          },
        "gen3":{
            base_blue: "#3283C8",
            base_blue_light: "#05B8EE",
            lime: "#7EC500",
            iris: "#AD91FF",
            rose: "#E74C3C",
            bee: "#F4B940",
            pink: "#FF7ABC",
            highlight_orange: "#EF8523",
            highlight_orange_light: "#FF9635",
            mint: "#26D9B1",
            coal: "#4A4A4A",
            cloud: "#F5F5F5",
            gray: "#525252",
            lightgray: "#9B9B9B",
            smoke: "#D1D1D1",
            silver: "#E7E7E7",
            black: "#000000",
            white: "#FFFFFF",
            titanium: "#707070",
            obsidian: "#757575",
        },
      },
      fontFamily: {
          montserrat: ["Montserrat", "sans-serif"],
          sans: ["Source Sans Pro", "sans-serif"],
      },
      borderWidth: {
        DEFAULT: '1px',
        '0': '0',
        '1' :'1px',
        '2': '2px',
        '3': '3px',
        '4': '4px',
        '6': '6px',
        '8': '8px',
      },
      tooltipArrows: theme => ({
        'danger-arrow': {
          borderColor: theme('colors.red.400'),
          borderWidth: 1,
          backgroundColor: theme('colors.red.200'),
          size: 10,
          offset: 10
        },
      }),
    },

  },
  variants: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    plugin(function({ addUtilities }) {
      const newUtilities = {
        '.nextImageFillFix' : {
          width: 'auto !important',
          right: 'auto !important',
          'min-width': '0 !important',
        },
      }
      addUtilities(newUtilities)
    })

  ],
}
