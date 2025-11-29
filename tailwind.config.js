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
          base: "rgb(23 24 37)",
          card: "#0e0f13",
          card_danger: "#1a141b",
          card_success: "#17201e",
          card_hint: "#101625",

          /* light */
          light: {
            base: "#faf9f9",
            level_0: "#ffffff",
            level_1: "#f4f3f6",
            level_2: "#ffffff",
            level_2_danger: "#fff2f2",
            level_2_success: "#f5fff2",
            level_2_hint: "#f2f5ff",
          },

          /* in light mode, highlight instead brightness change */
          highlighting: {
            light: {
              default: "#e8e6e6",
            }
          }
        },
        framing: {
          default: "#232430",
          default_danger: "#521e1e",
          default_success: "#204f2e",
          default_hint: "#20384f",

          /* light */
          light: {
            default: "#e8e6e6",
            default_danger: "#f4c2c2",
            default_success: "#9eedb5",
            default_hint: "#7dc6f4",
          }
        },
        shadow: {
          default: "#0f0d12",

          /* light */
          light: {
            default: "#c8c8c8"
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
            primary: "#000",
            secondary: "rgb(96,96,96)",
            danger: "#b94242",
            success: "#28ad4e",
            hint: "#1d8dc2",
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

