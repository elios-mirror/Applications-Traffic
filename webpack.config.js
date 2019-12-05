const path = require('path');
var nodeExternals = require('webpack-node-externals');
const NodemonPlugin = require('nodemon-webpack-plugin');

module.exports = {
    target: 'node',
    externals: [nodeExternals()],
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                loader: 'url-loader',
                options: {
                    limit: 10000
                }
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.html']
    },
    output: {
        filename: 'index.js',
        libraryTarget: 'commonjs',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new NodemonPlugin()
    ]
};
