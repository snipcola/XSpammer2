module.exports = {
  reactStrictMode: false,
  images: {
    unoptimized: true
  },
  webpack: (config, { isServer }) => {
    if (!isServer) config.target = 'electron-renderer';

    config.module.rules.push({
      test: /\.node/,
      use: 'ignore-loader'
    });

    return config;
  },
};
