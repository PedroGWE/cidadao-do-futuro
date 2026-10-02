/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f1f7f4', 100: '#e5efe8', 200: '#c7ddd2', 300: '#9fc4b3',
          400: '#66a18a', 500: '#357c68', 600: '#185B4C', 700: '#124739',
          800: '#103b31', 900: '#0c3028',
        },
        // Verde crescimento — apoio, progresso, conclusão
        growth: {
          50: '#f0f9ec',
          100: '#dcf0d3',
          500: '#66a18a', 600: '#357c68', 700: '#185B4C',
        },
        // Laranja conquista — destaques pontuais (botões de ação, badges)
        star: {
          50: '#fef4e6',
          100: '#fde4c2',
          500: '#E8B74C', 600: '#d6a536', 700: '#b98722',
        },
        // Grafite no lugar do preto puro
        graphite: '#233B33',
        cream: '#F6F3EA',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
