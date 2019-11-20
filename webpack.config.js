const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = (_env, argv) => {
  const mode = argv.mode || "production";
  return {
    mode,
    devtool: "source-map",
    // devtool: mode === "production" ? "source-map" : "eval",
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    entry: "./src/index.tsx",
    output:
      mode !== "production"
        ? {
            filename: "[name].bundle.js",
            chunkFilename: "[name].chunk.js",
            publicPath: "/",
          }
        : {
            filename: "[contenthash].js",
            chunkFilename: "[contenthash].chunk.js",
          },
    devServer: {
      port: 8000,
      historyApiFallback: true,
      after: (app, server, compiler) => {
        console.log(app, server, compiler);
      },
    },
    module: {
      rules: [
        {
          test: /\.(js)$/,
          exclude: mode !== "production" ? undefined : /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              cacheDirectory: mode !== "production",
            },
          },
        },
        {
          test: /\.(ts|tsx)$/,
          exclude: mode !== "production" ? undefined : /node_modules/,
          use: [
            {
              loader: "babel-loader",
              options: {
                cacheDirectory: mode !== "production",
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            mode !== "production" ? { loader: "style-loader", options: { hmr: true } } : MiniCssExtractPlugin.loader,
            { loader: "css-loader", options: { importLoaders: mode === "production" ? 1 : 0 } },
          ],
        },
        {
          test: /\.scss$/,
          use: [
            mode !== "production" ? { loader: "style-loader", options: { hmr: true } } : MiniCssExtractPlugin.loader,
            {
              loader: "ts-css-modules-webpack-loader",
              options: {
                hmr: true,
                dest: "./definitions",
                root: "./src",
              },
            },
            {
              loader: "css-loader",
              options: {
                modules: true,
                importLoaders: 2,
                camelCase: false,
                localIdentName: mode !== "production" ? "[name]__[local]" : "[hash:base64:10]",
              },
            },
            { loader: "sass-loader" },
          ],
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: "./src/index.html",
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[id].css",
      }),
      new ForkTsCheckerWebpackPlugin({
        watch: ["src", "definitions"],
        tslint: false,
        async: false,
        useTypescriptIncrementalApi: mode !== "production",
      }),
    ],
  };
};
