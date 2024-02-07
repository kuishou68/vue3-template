import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import cleaner from 'rollup-plugin-cleaner'; //如果使用 rollup 之后 emptyOutDir 会失效,需要使用这个插件清空上次构建结果
import { visualizer } from "rollup-plugin-visualizer";
// import { chunkSplitPlugin } from 'vite-plugin-chunk-split';

import qiniu from 'qiniu'
import {qiniuPlugin} from '@puhaha/vite-plugin-upload-oss'
const QINIU_ACCESS_KEY = "";
const QINIU_SECRET_KEY = "";

const ossConfig ={
  sdk: qiniu,
  accessKey: QINIU_ACCESS_KEY,
  secretKey: QINIU_SECRET_KEY,
  bucket: 'static',
  filePath: './dist',
  appName:"diagnosticPlatform",
  publicCdnPath: '',
  remoteFilePath: '',
  uploadTarget:"./dist",
  openConfirm: false,
  enabledRefresh: true,
  excludeHtml:true
};


// https://vitejs.dev/config/
export default ({mode}) => {
  console.log("mode--->", mode);
  return defineConfig({
    // base: mode=='production' ? `${ossConfig.publicCdnPath}${ossConfig.remoteFilePath}` : '',
    define: {
      // 具体环境设置是否开启
      __VUE_PROD_DEVTOOLS__: true
    },
    plugins: [
      vue(),
      vueJsx(),
      // qiniuPlugin(ossConfig),
      visualizer(), // 包大小分析插件，打包后根目录生成 stats.html 查看
      // chunkSplitPlugin({
      //   strategy: 'unbundle', // 实现不打包的效果，一个文件一个 chunk
      //   customSplitting: {
      //     // `vue` 会被打包到一个名为`render-vendor`的 chunk 里面(包括它们的一些依赖，如 object-assign)
      //     'vue-vendor': ['vue'],
      //     // 将组件库的代码打包
      //     'library': ['antd'],
      //     // 源码中 utils 目录的代码都会打包进 `utils` 这个 chunk 中
      //     // 'utils': [/src\/utils/]
      //   }
      // }),
      Components({
        resolvers: [
          AntDesignVueResolver({
            importStyle: false, // css in js
          }),
        ],
      }),
    ],
    server: {
      host: true
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    build: {
      assetsDir: "",
      emptyOutDir: true,
      rollupOptions: {
        output: {
          dir: "dist/",
          format: "iife"
        },
        plugins: [
          cleaner({
            targets: [
              'dist/'
            ]
          })
        ]
      },
      cssCodeSplit: false,
    }
  });
}
