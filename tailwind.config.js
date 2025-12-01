/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: 'selector',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
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
          item: "rgb(23 24 37)",
          card_danger: "#1a141b",
          card_success: "#17201e",
          card_hint: "#101625",
          item_danger: "#1a141b",
          item_success: "#17201e",
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
          item: "rgb(62 64 97)",
          highlight: "rgb(75 86 141)",
          default_danger: "#521e1e",
          default_success: "#204f2e",
          default_hint: "#20384f",
          item_danger: "#772f2f",
          item_success: "#2f6d41",
          item_hint: "#294764",
          highlight_danger: "#ad5959",
          highlight_success: "#4f9062",
          highlight_hint: "#517496",

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
          secondary: "rgb(156 163 175)", /* gray-400 */
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

