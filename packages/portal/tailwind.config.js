const mdx = require('@mdx-js/mdx')
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors : {
        "coal" : {
          DEFAULT: "#4A4A4A",
        }
      },
      fontFamily: {
        heading: ["Montserrat", "sans-serif"]
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
