const path = require('path')
const webpack = require('webpack')


module.exports = {
    entry: './frontend/src/index.js',
    
    output: {
        publicPath: './',
        path: path.resolve(__dirname, './frontend/static/build'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',   
            },
            {
                test: /\.(sass|css|scss)$/,
                use: [
                  'style-loader',
                  'css-loader',
                  {
                    loader: 'postcss-loader',
                    options: {
                        postcssOptions: {
                            plugins: () => [
                                require("autoprefixer")()
                              ],
                        },
                    },

                },
                  'sass-loader',
                ]
              },
              {
                test: /\.(gif|svg|jpg|png)$/,
                loader: "file-loader",
              },
        ]
      },
    optimization:{
        minimize: true,
    },
    // target: 'web', // Add this line to target Electron's renderer process
    devServer: {
      static: {
        directory: path.resolve(__dirname, './frontend/static/build'),
      },
      compress: true,
      port: 9485,
    },
};