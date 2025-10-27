const webpack = require('webpack');
const path = require('path');

module.exports = function override(config, env) {
  // Add fallbacks for Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "buffer": require.resolve("buffer"),
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "util": require.resolve("util"),
    "process": require.resolve("process/browser"),
  };

  // Add TypeScript path mapping
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, '../src'),
    '@/components': path.resolve(__dirname, '../src/components'),
    '@/hooks': path.resolve(__dirname, '../src/hooks'),
    '@/services': path.resolve(__dirname, '../src/services'),
    '@/types': path.resolve(__dirname, '../src/types'),
    '@/utils': path.resolve(__dirname, '../src/utils'),
    '@/store': path.resolve(__dirname, '../src/store'),
    '@/assets': path.resolve(__dirname, '../src/assets'),
    '@/constants': path.resolve(__dirname, '../src/constants'),
    '@/config': path.resolve(__dirname, '.'),
  };

  // Fix module resolution for TypeScript files
  config.resolve.extensions = [
    '.web.js',
    '.js',
    '.web.ts',
    '.ts',
    '.web.tsx',
    '.tsx',
    '.json',
    '.web.jsx',
    '.jsx',
  ];

  // Add plugins
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ];

  // Optimize chunk splitting for better loading
  config.optimization = {
    ...config.optimization,
    splitChunks: {
      ...config.optimization.splitChunks,
      chunks: 'all',
      cacheGroups: {
        ...config.optimization.splitChunks?.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        lucide: {
          test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
          name: 'lucide-react',
          chunks: 'all',
          priority: 20,
        },
      },
    },
  };

  // Add error handling for chunk loading failures
  config.output = {
    ...config.output,
    chunkLoadingGlobal: 'webpackChunkSafeAI',
    globalObject: 'self',
  };

  // Configure PostCSS to use our config
  config.module.rules.forEach(rule => {
    if (rule.oneOf) {
      rule.oneOf.forEach(oneOf => {
        if (oneOf.use && Array.isArray(oneOf.use)) {
          oneOf.use.forEach(use => {
            if (use.loader && use.loader.includes('postcss-loader')) {
              use.options = {
                ...use.options,
                postcssOptions: {
                  config: path.resolve(__dirname, 'postcss.config.js'),
                },
              };
            }
          });
        }
      });
    }
  });

  return config;
};
