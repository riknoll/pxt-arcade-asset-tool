const path = require('path'),
    webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        app: ["./src/index.tsx"],
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'js/[name].bundle.js'
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                loader: 'ts-loader'
            },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            inject: false,
            hash: false,
            title: 'pxt-editor-extension-sample',
            semanticUIPath: 'semantic-ui-css',
            reactPath: 'react',
            reactDomPath: 'react-dom',
            react: 'development',
            template: './src/index.html',
            filename: 'index.html'
        })
    ],
    devServer: {
        contentBase: [
            path.join(__dirname, 'build'),
            path.join(__dirname, 'dist'),
            path.join(__dirname, 'node_modules'),
        ],
        hot: true,
        port: 3000
    },
    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    }
};