import TerserPlugin from 'terser-webpack-plugin';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

export default {
  mode: 'production',
  entry: './loader.js',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          format: {
            comments: false
          }
        },
        extractComments: false
      })
    ]
  },
  output: {
    filename: 'pineglade-pp.min.js',
    path: dirname(fileURLToPath(import.meta.url))
  }
};
