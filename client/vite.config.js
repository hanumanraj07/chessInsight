import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * recharts v3 imports `es-toolkit/compat/<name>`, whose package "exports" resolve
 * to CJS files. Rolldown (Vite 8's bundler) miscompiles that CJS interop into
 * self-referential `var require_identity = require_identity()`, which crashes the
 * Radar/Polar charts at runtime with "n is not a function".
 *
 * Redirect those specifiers to the ESM compat barrel instead, exposing the
 * named export as the default the way `es-toolkit/compat/<name>` does.
 */
const esToolkitCompatEsm = () => ({
  name: 'es-toolkit-compat-esm',
  enforce: 'pre',
  resolveId(id) {
    const m = /^es-toolkit\/compat\/([A-Za-z0-9_$]+)$/.exec(id);
    return m ? `\0es-toolkit-compat:${m[1]}` : null;
  },
  load(id) {
    const m = /^\0es-toolkit-compat:([A-Za-z0-9_$]+)$/.exec(id);
    // `es-toolkit/compat` (bare) resolves to the ESM barrel via its `import` condition.
    return m
      ? `export { ${m[1]} as default } from 'es-toolkit/compat';`
      : null;
  },
});

export default defineConfig({
  plugins: [esToolkitCompatEsm(), react(), tailwindcss()],
  server: { port: 5173 },
});
