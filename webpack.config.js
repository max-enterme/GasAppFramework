/**
 * webpack configuration for GasAppFramework ES Modules
 */

const path = require('path');
const GasPlugin = require('gas-webpack-plugin');

module.exports = {
    mode: 'none',
    context: __dirname,
    entry: {
        // Only build main.js - includes everything
        // Use "0_" prefix to ensure it loads first (before test/@entrypoint.ts)
        '0_main': './gas-main.ts'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build'),
        library: {
            name: 'GasAppFramework',
            type: 'var'
        },
        globalObject: 'this'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        configFile: path.resolve(__dirname, 'tsconfig.json')
                    }
                },
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new GasPlugin({
            comments: true
        })
    ],
    optimization: {
        minimize: false,
        concatenateModules: true
    }
};
