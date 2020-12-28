const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    mode:'production',
    entry: {
        main: "./src/index.js",
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].min.js",
    },
    plugins: [
        new HtmlWebpackPlugin({
            chunk: ["main"],
            template: "./src/index.html",
            filename: "./index.html",
        }),
        new CopyPlugin({
            patterns: [
                { from: "./assets", to: "./assets" },
            ],
        }),
    ],
    devServer: {
        hot: true,
        contentBase: path.join(__dirname, "dist"),
        compress: true,
        port: 8888,
    },
    devtool:'eval-cheap-source-map'
};
