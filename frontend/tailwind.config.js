/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './main.jsx',
    './GestorCentralApp.jsx',
    './components/**/*.{js,jsx}',
    './chat/**/*.{js,jsx}',
    './perfil/**/*.{js,jsx}',
    './social/**/*.{js,jsx}',
    './tienda/**/*.{js,jsx}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
};