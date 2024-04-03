import {
  mergeConfig, loadEnv, defineConfig, UserConfigExport,
} from 'vite';
import vue from '@vitejs/plugin-vue';
import eslint from 'vite-plugin-eslint';
import svgLoader from 'vite-svg-loader';
import { resolve } from 'path';
import { codeInspectorPlugin } from 'code-inspector-plugin';

export const commonConfig: UserConfigExport = {
  define: {
    // eslint-disable-next-line global-require
    __APP_VERSION__: JSON.stringify(require('./package.json').version),
  },
  plugins: [
    eslint({
      cache: false,
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/es/**',
        './types/amap-jsapi-plugins-types/**',
      ],
    }),
    svgLoader(),
    vue(),
    codeInspectorPlugin({
      bundler: 'vite',
    }),
  ],
};

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return mergeConfig(
    commonConfig,
    {
      build: {
        emptyOutDir: true,
        copyPublicDir: false,
        sourcemap: false,
        outDir: resolve(__dirname, './dist'),
        lib: {
          entry: [
            resolve(__dirname, './src/index.ts'),
          ],
          name: 'vue3-amap',
          formats: ['es'],
          fileName: (format) => `index.${format}.js`,
        },
        rollupOptions: {
          output: [
            {
              format: 'es',
              entryFileNames: '[name].js',
              preserveModules: true,
              exports: undefined,
              dir: resolve(__dirname, 'es'),
              preserveModulesRoot: 'src',
            },
            {
              format: 'es',
              entryFileNames: '[name].js',
              preserveModules: false,
              exports: undefined,
              dir: resolve(__dirname, 'dist'),
            },
          ],
          external: ['vue'],
        },
      },
    },
    true,
  );
});
