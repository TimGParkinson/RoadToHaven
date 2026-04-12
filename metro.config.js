const { getDefaultConfig } = require('expo/metro-config');

// babel.config.js handles the react-native-google-mobile-ads stub
// redirect for Expo Go via babel-plugin-module-resolver.
// No custom resolver needed here.
const config = getDefaultConfig(__dirname);

module.exports = config;
