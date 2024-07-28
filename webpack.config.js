const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const devMode = process.env.NODE_ENV !== 'production';
const pages = fs
  .readdirSync('src/pages/')
  .filter((file) => path.extname(file) === '.html');

/** @type { import('webpack').Configuration } */
module.exports = {
  entry: {
    main: './src/js/main.js',
  },
  output: {
    filename: devMode ? 'js/[name].js' : 'js/[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    assetModuleFilename: 'assets/[hash][ext][query]',
  },
  mode: devMode ? 'development' : 'production',
  devtool: devMode ? 'inline-source-map' : 'source-map',
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'src'),
    },
    port: 3000,
    hot: true,
    compress: true,
    historyApiFallback: true,
  },
  plugins: [
    ...pages.map(
      (filename) =>
        new HtmlWebpackPlugin({
          hash: true,
          minify: true,
          title: 'WebKit',
          favicon: 'src/assets/icons/favicon.svg',
          filename,
          template: `src/pages/${filename}`,
        }),
    ),
    new MiniCssExtractPlugin({
      filename: devMode ? 'css/[name].css' : 'css/[contenthash].css',
      chunkFilename: devMode ? 'css/[name].css' : 'css/[contenthash].css',
    }),
    new TerserPlugin({
      parallel: true,
      terserOptions: {
        ecma: 5,
      },
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: 'src/assets', to: 'assets' }],
    }),
  ],
  module: {
    rules: [
      // {
      //   test: /\.(js|jsx)$/,
      //   exclude: /node_modules/,
      //   use: {
      //     loader: 'babel-loader',
      //     options: {
      //       presets: ['@babel/preset-env'],
      //     },
      //   },
      // },
      {
        test: /\.(sa|sc|c)ss$/i,
        include: path.resolve(__dirname, 'src'),
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(csv|tsv)$/i,
        use: ['csv-loader'],
      },
      {
        test: /\.xml$/i,
        use: ['xml-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src/'),
    },
  },
  optimization: {
    minimizer: [new CssMinimizerPlugin({})],
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
