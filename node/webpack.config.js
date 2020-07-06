const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => ({
    target: 'node',
    resolve: {
        extensions: ['.ts']
    },
    module: {
        rules: [{ test: /\.ts$/, use: 'ts-loader' }]
    },
    entry: {
        index: ['./src/index'],
        worker: ['./src/worker']
    },
    output: {
        libraryTarget: 'commonjs',
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
    },
    optimization: {
        minimize: argv.mode === 'production',
        minimizer: [new TerserPlugin()]
    }
});
