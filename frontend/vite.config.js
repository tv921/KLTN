import { defineConfig, normalizePath } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const standardFontsDir = normalizePath(path.join(pdfjsDistPath, 'standard_fonts'));
const pdfWorkerPath = normalizePath(path.join(pdfjsDistPath, 'build', 'pdf.worker.min.js'));

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: standardFontsDir, dest: '' },
        { src: pdfWorkerPath, dest: '' },
      ],
    }),
  ],
});
