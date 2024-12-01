const { spacing, fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./Components/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enables dark mode using the "class" strategy
  theme: {
    extend: {
      boxShadow: {
        2: "0 1px 3px 0 rgb(11 17 29 / 98%), 0 1px 2px 0 rgb(9 18 35 / 90%)",
      },
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.gray.700"),
            a: {
              color: theme("colors.blue.500"),
              "&:hover": {
                color: theme("colors.blue.700"),
              },
              code: { color: theme("colors.blue.400") },
            },
            "h1, h2, h3, h4": {
              color: theme("colors.gray.800"),
              "scroll-margin-top": spacing[32],
            },
            code: {
              backgroundColor: theme("colors.gray.100"),
              color: theme("colors.red.500"),
              borderRadius: theme("borderRadius.md"),
              padding: `${spacing[1]} ${spacing[2]}`,
            },
            pre: {
              backgroundColor: theme("colors.gray.900"),
              color: theme("colors.gray.100"),
              padding: theme("spacing.4"),
              borderRadius: theme("borderRadius.lg"),
              overflowX: "auto",
            },
            "pre code": {
              backgroundColor: "transparent",
              color: "inherit",
              padding: "0",
            },
            blockquote: {
              borderLeftColor: theme("colors.gray.300"),
              fontStyle: "italic",
              color: theme("colors.gray.600"),
              paddingLeft: theme("spacing.4"),
            },
            "blockquote p:first-of-type::before": false,
            "blockquote p:last-of-type::after": false,
            table: {
              width: "100%",
              borderCollapse: "collapse",
              borderSpacing: "0",
              borderWidth: "1px",
              borderColor: theme("colors.gray.300"),
            },
            thead: {
              backgroundColor: theme("colors.gray.100"),
              borderBottom: `2px solid ${theme("colors.gray.300")}`,
              color: theme("colors.gray.800"),
            },
            tbody: {
              tr: {
                borderBottom: `1px solid ${theme("colors.gray.300")}`,
              },
            },
          },
        },
        dark: {
          css: {
            color: theme("colors.gray.300"),
            a: {
              color: theme("colors.blue.400"),
              "&:hover": {
                color: theme("colors.blue.600"),
              },
              code: { color: theme("colors.blue.400") },
            },
            "h1, h2, h3, h4": {
              color: theme("colors.gray.100"),
            },
            code: {
              backgroundColor: theme("colors.gray.800"),
              color: theme("colors.gray.350"),
            },
            pre: {
              backgroundColor: theme("colors.gray.800"),
              color: theme("colors.gray.100"),
            },
            blockquote: {
              borderLeftColor: theme("colors.gray.700"),
              color: theme("colors.gray.300"),
            },
            hr: { borderColor: theme("colors.gray.700") },
            ol: {
              li: {
                "&:before": { color: theme("colors.gray.500") },
              },
            },
            ul: {
              li: {
                "&:before": { backgroundColor: theme("colors.gray.500") },
              },
            },
            strong: { color: theme("colors.gray.300") },
            thead: {
              backgroundColor: theme("colors.gray.800"),
              color: theme("colors.gray.100"),
            },
            tbody: {
              tr: {
                borderBottomColor: theme("colors.gray.700"),
              },
            },
          },
        },
      }),
    },
  },
  variants: {
    extend: {
      typography: ["dark"],
      boxShadow: ["dark"],
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
