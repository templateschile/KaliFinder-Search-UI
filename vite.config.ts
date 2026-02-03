import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import autoprefixer from 'autoprefixer';
import path from 'path';
import { defineConfig } from 'vite';
import { shadowCssPlugin } from './vite-plugin-shadow-css';
import { inlineCssPlugin } from './vite-plugin-inline-css';

export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
  },
  plugins: [
    react({
      useAtYourOwnRisk_mutateSwcOptions(options) {
        options.jsc = options.jsc || {};
        options.jsc.transform = options.jsc.transform || {};
        options.jsc.transform.react = options.jsc.transform.react || {};
        options.jsc.transform.react.development = mode === 'development';
        options.jsc.transform.react.refresh = false;
        options.jsc.transform.react.runtime = 'automatic';
      },
    }),
    tailwindcss(),
    shadowCssPlugin(),
    inlineCssPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    __DEV__: mode === 'development',
    'import.meta.env.VITE_BACKEND_URL': JSON.stringify(
      process.env.VITE_BACKEND_URL || 'https://api.kalifinder.com'
    ),
    'import.meta.env.VITE_WIDGET_CDN_URL': JSON.stringify(
      process.env.VITE_WIDGET_CDN_URL || 'https://cdn.kalifinder.com'
    ),
  },
  css: {
    postcss: {
      plugins: [autoprefixer()],
    },
  },
  build: {
    sourcemap: mode === 'development',
    minify: mode === 'development' ? false : 'esbuild',
    esbuild: {
      // Strip debug statements from production builds only
      drop: mode === 'production' ? ['console', 'debugger'] : [],
      // More aggressive minification
      legalComments: 'none',
      treeShaking: true,
    },
    cssMinify: 'esbuild',
    // Disable code splitting to bundle all CSS together for shadowCssPlugin
    cssCodeSplit: false,
    reportCompressedSize: false,
    emptyOutDir: true,
    outDir: 'dist',
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    lib:
      process.env.BUILD_TARGET === 'esm'
        ? {
            entry: path.resolve(__dirname, 'src/esm.tsx'),
            name: 'KalifinderESM',
            fileName: () => `index.es.js`,
            formats: ['es'],
          }
        : {
            entry: path.resolve(__dirname, 'src/embed/bootstrap.tsx'),
            name: 'Kalifinder',
            fileName: () => `kalifind-search.js`,
            formats: ['umd'],
          },
    rollupOptions:
      process.env.BUILD_TARGET === 'esm'
        ? {
            treeshake: {
              moduleSideEffects: false,
              propertyReadSideEffects: false,
              unknownGlobalSideEffects: false,
            },
            output: {
              entryFileNames: 'index.es.js',
            },
          }
        : {
            treeshake: {
              moduleSideEffects: false,
              propertyReadSideEffects: false,
              unknownGlobalSideEffects: false,
            },
            output: {
              inlineDynamicImports: true,
              entryFileNames: 'kalifind-search.js',
              assetFileNames: (assetInfo) => {
                if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                  return 'kalifind-search.css';
                }
                return assetInfo.name || 'assets/[name][extname]';
              },
            },
          },
  },
}));
