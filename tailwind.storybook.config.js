const colors = require('tailwindcss/colors');
const baseConfig = require( "./tailwind.config");

/** @type {import('tailwindcss').Config} */
module.exports = Object.assign({}, baseConfig, {
    // storybook hotreload, to slow, might be better to run different tailwind config for storybook with this safelist
  safelist: [
    {
      pattern: /^(.*?)/,
    },
  ],
});