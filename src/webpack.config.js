const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      path: require.resolve('path-browserify'),
      url: require.resolve('url/'),
    },
  },
};
