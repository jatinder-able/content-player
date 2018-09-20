/** 
 * @author Manjunath Davanam<manjunathd@ilimi.in> 
 * @description - Which minifies and bundles the all core plugins  with js/css dependency files.
 *                - Before bundle It will read the plugins views and dependency object which is defined in the plugin manifest.json.
 */

// Dependency files 
const path = require('path');
const webpack = require('webpack');
const glob = require('glob');
const uglifyjs = require('uglify-js');
const expose = require('expose-loader');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const fs = require('fs');
const entryPlus = require('webpack-entry-plus');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const WebpackOnBuildPlugin = require('on-build-webpack');

const PLUGINS_BASE_PATH = './public/coreplugins/'; // Plugins base path
const PACKAGE_JS_FILE_NAME = 'coreplugins.js'; // Packaged all plugins js file name
const PACKAGE_CSS_FILE_NAME = 'coreplugins.css'; // Packaged all plugins css files name
const OUTPUT_PATH = 'public/coreplugins-dist'; //'public/'; // Package file path.
const DIST_OUTPUT_FILE_PATH = '/renderer/plugin.dist.js'; // dist file path which is created in each plugins folder
const CONFIG = {
    drop_console: process.env.drop_console || false,
    mangle: process.env.mangle || false,
}

const PLUGINS = process.env.plugins || [
    "org.ekstep.launcher-1.0",
    "org.ekstep.repo-1.0",
    "org.ekstep.toaster-1.0",
    "org.ekstep.alert-1.0",
    "org.ekstep.telemetrysync-1.0",
    "org.ekstep.nextnavigation-1.0",
    "org.ekstep.previousnavigation-1.0",
    "org.ekstep.genie-1.0",
    "org.ekstep.htmlrenderer-1.0",
    "org.ekstep.videorenderer-1.0",
    "org.ekstep.pdfrenderer-1.0",
    "org.ekstep.epubrenderer-1.0",
    //"org.ekstep.ecmlrenderer-1.0",
    //"org.ekstep.extcontentpreview-1.0"
];

let entryFiles = []

function getEntryFiles() {
    entryFiles = [{
        entryFiles: packagePlugins(),
        outputName: PACKAGE_JS_FILE_NAME,
    }, {
        entryFiles: getVendorCSS()
    }, ]
    return entryPlus(entryFiles);
}
cleanDistFiles = function() {
    PLUGINS.forEach(function(plugin) {
        if (fs.existsSync(`${PLUGINS_BASE_PATH}${plugin}${DIST_OUTPUT_FILE_PATH}`)) {
            fs.unlinkSync(`${PLUGINS_BASE_PATH}${plugin}${DIST_OUTPUT_FILE_PATH}`);
        }
    })
}

function packagePlugins() {
    var pluginPackageArr = [];
    PLUGINS.forEach(function(plugin) {
        var dependenciesArr = [];
        var packagedDepArr = [];
        var manifest = JSON.parse(fs.readFileSync(`${PLUGINS_BASE_PATH}${plugin}/manifest.json`));
        console.log("manifest", manifest)
        var pluginContent = fs.readFileSync(`${PLUGINS_BASE_PATH}${plugin}/renderer/plugin.js`, 'utf8');
        if (fs.existsSync(`${PLUGINS_BASE_PATH}${plugin}${DIST_OUTPUT_FILE_PATH}`)) {
            fs.unlinkSync(`${PLUGINS_BASE_PATH}${plugin}${DIST_OUTPUT_FILE_PATH}`);
        }
        if (manifest.renderer.views && pluginContent) {
            var controllerPathArr = [];
            var templatePathArr = [];
            manifest.renderer.views.forEach(function(obj, i) {
                controllerPathArr[i] = (obj.controller) ? 'require("' + obj.controller + '")' : undefined;
                templatePathArr[i] = (obj.template) ? 'require("' + obj.template + '")' : undefined;
            });
            var count = 0;
            console.log(pluginContent.match(/\b(loadNgModules)\b.*\)/g));

            var len = (pluginContent.replace(/\b(loadNgModules)\b.*\)/g) || []).length;
            pluginContent = uglifyjs.minify(pluginContent.replace(/\b(loadNgModules)\b.*\)/g, function($0) {
                if (count === len) count = 0;
                var dash;
                dash = 'loadNgModules(' + templatePathArr[count] + ' , ' + controllerPathArr[count] + ', true)'
                count++;
                return dash;

            }))

        } else {
            pluginContent = uglifyjs.minify(pluginContent);
        }

        if (manifest.renderer.dependencies) {
            manifest.renderer.dependencies.forEach(function(obj, i) {
                if (obj.type == "js") {
                    dependenciesArr[i] = fs.readFileSync(`${PLUGINS_BASE_PATH}${plugin}/${obj.src}`, 'utf8');
                }
            });
        }
        dependenciesArr.push('org.ekstep.pluginframework.pluginManager.registerPlugin(' + JSON.stringify(manifest) + ',' + pluginContent.code.replace(/;\s*$/, "") + ')')

        fs.appendFile(`${PLUGINS_BASE_PATH}${plugin}${DIST_OUTPUT_FILE_PATH}`, [...dependenciesArr].join("\n"))
        pluginPackageArr.push(`${PLUGINS_BASE_PATH}${plugin}${DIST_OUTPUT_FILE_PATH}`)
    })

    return pluginPackageArr;
}

function getVendorCSS() {
    var cssDependencies = [];
    PLUGINS.forEach(function(plugin) {
        var manifest = JSON.parse(fs.readFileSync(`${PLUGINS_BASE_PATH}${plugin}/manifest.json`));
        if (manifest.renderer.dependencies) {
            manifest.renderer.dependencies.forEach(function(dep) {
                if (dep.type === "css") {
                    cssDependencies.push(`${PLUGINS_BASE_PATH}${plugin}/${dep.src}`)
                }
            })
        };
    })
    return cssDependencies;
}

module.exports = {

    entry: getEntryFiles(),

    output: {
        filename: '[name]',
        path: path.resolve(__dirname, OUTPUT_PATH),
    },
    resolve: {
        alias: {
            'jquery': path.resolve('./public/libs/jquery.min.js'),
            'creatine:': path.resolve(`${PLUGINS_BASE_PATH}org.ekstep.ecmlrenderer-1.0/renderer/libs/creatine-1.0.0.min.js`),
        }
    },
    module: {
        rules: [{
                test: /\.html$/,
                use: [{
                    loader: 'html-loader',
                    options: {
                        minimize: true,
                        removeComments: false,
                        collapseWhitespace: false
                    }
                }],
            },
            {
                test: require.resolve(`${PLUGINS_BASE_PATH}org.ekstep.toaster-1.0/renderer/libs/toastr.min.js`),
                use: [{
                    loader: 'expose-loader',
                    options: 'toastr'
                }]
            },
            {
                test: require.resolve(`${PLUGINS_BASE_PATH}org.ekstep.telemetrysync-1.0/renderer/libs/md5.js`),
                use: [{
                    loader: 'expose-loader',
                    options: 'CryptoJS'
                }]
            },
            {
                test: require.resolve(`${PLUGINS_BASE_PATH}org.ekstep.ecmlrenderer-1.0/renderer/libs/creatine-1.0.0.min.js`),
                use: [{
                    loader: 'expose-loader',
                    options: 'creatine'
                }]
            },
            {
                test: /\.(s*)css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: false,
                            minimize: true,
                            "preset": "advanced",
                            discardComments: {
                                removeAll: true
                            }
                        }
                    }
                ]
            }, {
                test: /\.(gif|png|jpeg|svg)$/,
                use: [
                    'file-loader',
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 50, //it's important
                            outputPath: './images/assets',
                            name: '[name].[ext]',
                        }
                    },
                ],
            }, {
                test: /\.(woff|woff2|eot|ttf|otf|svg|png)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: './fonts/',
                        limit: 10000,
                        fallback: 'responsive-loader'
                    }
                }]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: PACKAGE_CSS_FILE_NAME,
        }),
        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            RSVP: 'rsvp',
            toastr: path.resolve(`${PLUGINS_BASE_PATH}org.ekstep.toaster-1.0/renderer/libs/toastr.min.js`),
            CryptoJS: path.resolve(`${PLUGINS_BASE_PATH}org.ekstep.telemetrysync-1.0/renderer/libs/md5.js`),
            JSZip: path.resolve(`${PLUGINS_BASE_PATH}org.ekstep.epubrenderer-1.0/renderer/libs/jszip.min.js`),
            videojs: path.resolve(`${PLUGINS_BASE_PATH}org.ekstep.videorenderer-1.0/renderer/libs/video.js`),
            createjs: path.resolve(`${PLUGINS_BASE_PATH}org.ekstep.ecmlrenderer-1.0/renderer/libs/createjs.min.js`),
            creatine: path.resolve(`${PLUGINS_BASE_PATH}org.ekstep.ecmlrenderer-1.0/renderer/libs/creatine-1.0.0.min.js`),
        }),
        new UglifyJsPlugin({
            cache: false,
            parallel: true,
            uglifyOptions: {
                compress: {
                    dead_code: true,
                    drop_console: CONFIG.drop_console,
                    global_defs: {
                        DEBUG: true
                    },
                    passes: 1,
                },
                ecma: 5,
                mangle: CONFIG.mangle
            },
            sourceMap: true
        }),
        new WebpackOnBuildPlugin(function(stats) {
            cleanDistFiles();
            console.log("Cleared all plugin.dist.js files");
            // Remove the plugin.dist files from all plugins folder once build is done.
        }),

    ],
    optimization: {
        minimize: true,
        splitChunks: {
            chunks: 'async',
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '~',
        }
    }
};