import { splitVendorChunkPlugin } from 'vite'
import vue from '@vitejs/plugin-vue2'
// import legacy from '@vitejs/plugin-legacy'
import path from 'path'
import { resolve } from 'path'

export default () => {
  return {
    server: {
      host: true,
      port: 28847,
    },
    plugins: [
      vue(),
      splitVendorChunkPlugin(),
      // legacy({
      //   targets: ['defaults', 'ie >= 11'],
      //   additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      // }),
    ],
    build: {
      target: 'es2015',
      chunkSizeWarningLimit: 2000,
      lib: {
        entry: resolve(__dirname, 'packages/image-label.vue'),
        name: 'ImageLabel',
        fileName: (format) => `vue2-image-label.${format}.js`,
      },
    },
    resolve: {
      alias: [
        // /@/xxxx => src/xxxx
        {
          find: /\/@\//,
          replacement: path.resolve('src') + '/',
        },
      ],
    },
  }
}
