const nodeResolve = require("rollup-plugin-node-resolve")
const vuePlugin = require('rollup-plugin-vue')
const postcss = require('rollup-plugin-postcss')
const common = require("./rollup.cjs")
module.exports = {
    input: "src/main.js",
    output: {
        file: "dist/index.aio.js",
        format: "umd",
        name: "vue2-image-label",
        banner: common.banner
    },
    plugins: [
        common.getCompiler(),
        nodeResolve({
            main:true,
            extensions: [".js"]
        }),
        vuePlugin(),
        postcss({
            extensions:['.css','.less'],
            extract:'index.css'
        })
    ]
}