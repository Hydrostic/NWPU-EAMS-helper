import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import monkey from 'vite-plugin-monkey';
import tailwindcss from '@tailwindcss/vite';

const remRegex = /(?<=\d)rem/g;
const convertRemToEm = {
  postcssPlugin: 'convertRemToEm',
  // When debugging this, https://astexplorer.net/#/2uBU1BLuJ1 is very helpful
  Declaration(declaration) {
    declaration.value = declaration.value.replaceAll(remRegex, 'em');
  },
};
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    tailwindcss(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://raw.githubusercontent.com/Hydrostic/NWPU-EAMS-helper/refs/heads/main/src/assets/nwpu_logo.png',
        namespace: 'InsolubleHCO3/nwpu-eams-helper',
        match: ['https://jwxt.nwpu.edu.cn/student/home'],
      },
    }),
  ],
  css: {
    postcss: {
      plugins: [convertRemToEm]
    }
  },
  build: {
    minify: true
  }
});
