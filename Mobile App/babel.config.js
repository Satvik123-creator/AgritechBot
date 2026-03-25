module.exports = function (api) {
  api.cache(true);

  const plugins = [];
  
  if (process.env.NODE_ENV === 'production' || process.env.BABEL_ENV === 'production') {
    plugins.push('transform-remove-console');
  }

  // react-native-reanimated/plugin MUST be the very last plugin in the array
  plugins.push('react-native-reanimated/plugin');

  return {
    presets: ['babel-preset-expo'],
    plugins: plugins,
  };
};
