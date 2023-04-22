const pkg = require("../package.json")
const babel = require("@rollup/plugin-babel");

const version = pkg.version
const banner = `/*!
* ${pkg.name} ${version}
* Licensed under MIT
*/
`
exports.banner = banner

// babel编译ES6语法
function getCompiler (opt) {
    return babel({
        babelrc: false,
        presets: [
           [
               '@babel/preset-env',
               {
                   targets: {
                       browsers: 'last 2 versions, > 1%, ie>=10, chrome >= 45, safari >= 10'
                   },
                   modules: false,
                   loose: true
               }
           ] ,
        ],
        exclude: 'node_modules/**',
        plugins: [
            [
                '@babel/plugin-transform-runtime',
                {
                    corejs: 2
                }
            ]
        ]
    })
}

exports.getCompiler = getCompiler