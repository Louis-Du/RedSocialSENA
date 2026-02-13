module.exports = {
  content: [
    "./*.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        "sena-verde": "#39A900",
        "sena-azul-oscuro": "#00304D",
        "sena-fondo": "#F6F6F6",
        "sena-verde-claro": "#EAF7E2"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};
