/**
 * webpack configuration for GasAppFramework ES Modules
 */

const path = require('path');
const GasPlugin = require('gas-webpack-plugin');

module.exports = {
    mode: 'none',
    context: __dirname,
    entry: './modules/index.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'build'),
        library: {
            name: 'GasAppFramework',
            type: 'var'
        }
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
            comments: true,
            autoGlobalExportsFiles: ['**/*.ts']
        })
    ],
    optimization: {
        minimize: false,
        concatenateModules: true
    }
};
