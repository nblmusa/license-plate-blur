/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark tfjs-node as external on the server side
      config.externals.push('@tensorflow/tfjs-node')
    }
    // Handle binary files
    config.module.rules.push({
      test: /\.bin$/,
      use: 'file-loader',
    })
    return config
  }
};

module.exports = nextConfig;
