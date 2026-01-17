// Enhanced Production Configuration for TechResona
// Addresses all Google PageSpeed issues
const path = require("path");
const CompressionPlugin = require("compression-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
  eslint: {
    configure: {
      extends: ["plugin:react-hooks/recommended"],
      rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
    },
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig, { env }) => {
      // PRODUCTION ONLY - Maximum optimization
      if (env === 'production') {
        // Remove source maps completely
        webpackConfig.devtool = false;
        
        // Aggressive optimization configuration
        webpackConfig.optimization = {
          minimize: true,
          minimizer: [
            // Enhanced Terser for maximum JS minification
            new TerserPlugin({
              terserOptions: {
                parse: {
                  ecma: 8,
                },
                compress: {
                  ecma: 5,
                  warnings: false,
                  comparisons: false,
                  inline: 2,
                  // Remove all console logs
                  drop_console: true,
                  drop_debugger: true,
                  pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
                  // More aggressive optimizations
                  passes: 2,
                  unsafe: true,
                  unsafe_comps: true,
                  unsafe_math: true,
                  unsafe_methods: true,
                  // Remove unused code
                  dead_code: true,
                  unused: true,
                },
                mangle: {
                  safari10: true,
                },
                output: {
                  ecma: 5,
                  comments: false,
                  ascii_only: true,
                },
              },
              parallel: true,
              extractComments: false,
            }),
            // CSS minimizer
            new CssMinimizerPlugin({
              minimizerOptions: {
                preset: [
                  'default',
                  {
                    discardComments: { removeAll: true },
                    normalizeWhitespace: true,
                    colormin: true,
                    minifyFontValues: true,
                    minifyGradients: true,
                    minifySelectors: true,
                  },
                ],
              },
            }),
          ],
          // Optimized code splitting
          splitChunks: {
            chunks: 'all',
            maxInitialRequests: 25,
            minSize: 20000,
            maxSize: 244000,
            cacheGroups: {
              // React core - highest priority
              react: {
                test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom|scheduler)[\\/]/,
                name: 'vendor-react',
                chunks: 'all',
                priority: 20,
                enforce: true,
              },
              // Framer Motion - separate for lazy loading
              framer: {
                test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
                name: 'vendor-framer',
                chunks: 'async',
                priority: 18,
              },
              // Radix UI - separate chunk
              radix: {
                test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
                name: 'vendor-radix',
                chunks: 'all',
                priority: 15,
              },
              // Lenis smooth scroll - lazy load
              lenis: {
                test: /[\\/]node_modules[\\/]lenis[\\/]/,
                name: 'vendor-lenis',
                chunks: 'async',
                priority: 12,
              },
              // Other vendors
              vendors: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendor-other',
                chunks: 'all',
                priority: 10,
                reuseExistingChunk: true,
              },
              // Common code used across multiple chunks
              common: {
                minChunks: 2,
                priority: 5,
                reuseExistingChunk: true,
                enforce: true,
              },
            },
          },
          runtimeChunk: {
            name: 'runtime',
          },
          moduleIds: 'deterministic',
          // Tree shaking
          usedExports: true,
          sideEffects: true,
        };

        // Maximum compression
        webpackConfig.plugins.push(
          // Gzip compression
          new CompressionPlugin({
            filename: '[path][base].gz',
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 8192, // Lower threshold for more compression
            minRatio: 0.8,
            deleteOriginalAssets: false,
          }),
          // Brotli compression (better than gzip)
          new CompressionPlugin({
            filename: '[path][base].br',
            algorithm: 'brotliCompress',
            test: /\.(js|css|html|svg)$/,
            compressionOptions: {
              level: 11, // Maximum compression
            },
            threshold: 8192,
            minRatio: 0.8,
            deleteOriginalAssets: false,
          }),
          // Service Worker with aggressive caching
          new WorkboxWebpackPlugin.GenerateSW({
            clientsClaim: true,
            skipWaiting: true,
            maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
            exclude: [/\.map$/, /^manifest.*\.js$/, /\.br$/, /\.gz$/],
            runtimeCaching: [
              // Google Fonts - critical
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com/,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'google-fonts-stylesheets',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                  },
                },
              },
              {
                urlPattern: /^https:\/\/fonts\.gstatic\.com/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-webfonts',
                  expiration: {
                    maxEntries: 20,
                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              // Unsplash images
              {
                urlPattern: /^https:\/\/images\.unsplash\.com/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'unsplash-images',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              // Local images
              {
                urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'images',
                  expiration: {
                    maxEntries: 60,
                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                  },
                },
              },
              // API calls - network first
              {
                urlPattern: /\/api\//,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'api-cache',
                  networkTimeoutSeconds: 10,
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 5, // 5 minutes
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
            ],
          })
        );

        // Performance budgets
        webpackConfig.performance = {
          maxEntrypointSize: 400000, // 400KB
          maxAssetSize: 300000, // 300KB
          hints: 'warning',
          assetFilter: function(assetFilename) {
            // Don't warn about compressed files
            return !assetFilename.endsWith('.gz') && !assetFilename.endsWith('.br');
          },
        };

        // Module concatenation for better tree shaking
        webpackConfig.optimization.concatenateModules = true;
        
        // Remove webpack comments
        webpackConfig.optimization.minimize = true;
      }

      return webpackConfig;
    },
  },
};
