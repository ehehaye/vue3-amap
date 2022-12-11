import { resolve } from 'path';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import basicSsl from '@vitejs/plugin-basic-ssl';

/**
 * @type {() => import('vite').UserConfigExport}
 */
export default () => ({
  root: resolve(__dirname, '../../example'),
  publicDir: resolve(__dirname, '../../example/public'),
  base: '/vue3-amap/',
  plugins: [
    basicSsl(),
    Components({
      resolvers: [AntDesignVueResolver()],
    }),
  ],
  resolve: {
    alias: {
      'axios/lib/adapters/xhr': resolve(__dirname, '../../node_modules/axios/lib/adapters/xhr.js'),
    },
  },
  server: {
    https: true,
    proxy: {
      '/_AMapService': {
        target: 'https://www.abyssal.site',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: resolve(__dirname, '../../dist'),
  },
});
