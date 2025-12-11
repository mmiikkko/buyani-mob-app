module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    // Only keep the Reanimated plugin; Expo Router is already included in the preset (SDK 50+),
    // and this plugin must stay last.
    plugins: ['react-native-reanimated/plugin'],
  };
};

