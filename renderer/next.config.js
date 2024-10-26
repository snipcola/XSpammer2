module.exports = {
  output: "export",
  distDir: process.env.NODE_ENV === "production" ? "../app" : ".next",
  trailingSlash: true,
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) config.target = "electron-renderer";

    config.module.rules.push({
      test: /\.node/,
      use: "ignore-loader",
    });

    return config;
  },
};
