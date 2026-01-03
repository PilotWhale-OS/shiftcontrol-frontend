/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: 'selector',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      borderWidth: {
        ctr: "1.2px"
      },
      screens: {
        'desktop': '1024px',
        // => @media (min-width: 1024px) { ... }
      },
      transitionProperty: {
        width: 'width',
        height: 'height',
        spacing: 'margin, padding',
      },
      spacing: {
        xxs: "3px",
        xs: "5px",
        sm: "8px",
        md: "13px",
        lg: "21px",
        xl: "34px",
        xxl: "42px",
        xxxl: "60px",
      },
      colors: {
        background: {

          /* dark */
          base: "rgb(13 13 20)",
          card: "rgb(17 18 28)",
          item: "rgb(23 24 45)",
          card_danger: "rgb(16 8 15)",
          card_success: "#0e1413",
          card_hint: "#101625",
          item_danger: "rgb(46,2,14)",
          item_success: "rgb(24 41 29)",
          item_hint: "#101625",

          /* light */
          light: {
          },

          /* in light mode, highlight instead brightness change */
          highlighting: {
            light: {
            }
          }
        },
        framing: {
          default: "#232430",
          card: "#282a37",
          item: "rgb(76 81 157)",
          highlight: "rgb(113,119,193)",
          default_danger: "rgb(128 19 19)",
          default_success: "#2f6d41",
          default_hint: "#20384f",
          item_danger: "#772f2f",
          item_success: "rgb(29 150 64)",
          item_hint: "rgb(4 85 165)",
          highlight_danger: "#ad5959",
          highlight_success: "rgb(39 135 67)",
          highlight_hint: "rgb(42 120 215)",

          /* light */
          light: {
          }
        },
        shadow: {
          default: "#0f0d12",

          /* light */
          light: {
          }
        },
        text: {
          primary: "rgb(209 213 219)", /* gray-300 */
          secondary: "rgb(139,139,139)", /* gray-400 */
          danger: "#b94242",
          success: "#42b965",
          hint: "#1e9fdc",

          /* light */
          light: {
          }
        }
      }
    },
    fontFamily: {
      display: "Rubik"
    }
  },
  plugins: [
    function ({ addVariant }) {
      addVariant('light', '[data-theme="light"] &')
    },],
}

