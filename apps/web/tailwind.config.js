/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Azul confiança — cor dominante da marca (base #1B5FAA)
        brand: {
          50: '#eef5fc',
          100: '#d8e7f7',
          200: '#b3cfee',
          300: '#85b1e2',
          400: '#4f8cd0',
          500: '#2d71bc',
          600: '#1B5FAA',
          700: '#164e8c',
          800: '#113E70', // tom escuro — textos pequenos sobre fundo claro
          900: '#0d2f55',
        },
        // Verde crescimento — apoio, progresso, conclusão
        growth: {
          50: '#f0f9ec',
          100: '#dcf0d3',
          500: '#4CAF32',
          600: '#3f9129',
          700: '#337522',
        },
        // Laranja conquista — destaques pontuais (botões de ação, badges)
        star: {
          50: '#fef4e6',
          100: '#fde4c2',
          500: '#F7941D',
          600: '#dd7f0b',
          700: '#b56809',
        },
        // Grafite no lugar do preto puro
        graphite: '#2B2E33',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
