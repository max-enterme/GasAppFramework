/**
 * webpack configuration for GasAppFramework ES Modules
 */

const path = require('path');
const GasPlugin = require('gas-webpack-plugin');

module.exports = {
    mode: 'none',
    context: __dirname,
    entry: {
        // Main framework bundle - loads first
        '0_main': './gas-main.ts',
        // Test bundle - includes all tests
        '1_tests': './test/@entrypoint.ts'
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
        minimize: true,  // Minification有効化
        concatenateModules: false  // テスト登録のためモジュール結合を無効化
    }
};
