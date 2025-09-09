/** @type {import('postcss').Config} */
const postcssConfig = {
  plugins: {
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default postcssConfig;
