module.exports = {
    webpack: {
      configure: {
        resolve: {
          fallback: {
            path: require.resolve('path-browserify'),
            url: require.resolve('url/'),
          },
        },
      },
    },
  };
  