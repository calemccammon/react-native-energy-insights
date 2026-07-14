const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure font files inside node_modules are treated as assets
config.resolver.assetExts.push('ttf', 'otf', 'woff', 'woff2');

module.exports = config;
