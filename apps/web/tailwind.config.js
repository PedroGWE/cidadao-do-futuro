/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ECF2FA', 100: '#DCE8F6', 200: '#B9D1EC', 300: '#8CB1DB',
          400: '#5B8DC7', 500: '#3772B8', 600: '#2066B2', 700: '#1B4F8C',
          800: '#173F70', 900: '#142F54',
        },
        // Verde crescimento — apoio, progresso, conclusão
        growth: {
          50: '#EAF6E9',
          100: '#D5EDD3',
          500: '#46AF43', 600: '#237A32', 700: '#1D6429',
        },
        // Laranja conquista — destaques pontuais (botões de ação, badges)
        star: {
          50: '#FFF9E6',
          100: '#FFF4CC',
          500: '#FABE0C', 600: '#F0B40A', 700: '#7A4E00',
        },
        // Grafite no lugar do preto puro
        graphite: '#24364B',
        cream: '#F5F8FC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
