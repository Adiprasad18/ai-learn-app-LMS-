/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
  typedRoutes: false,

  // ?? Turn off all static pre-rendering – everything becomes runtime rendered
  experimental: {
    appDir: true,
    turbo: false,
    staticRenderingTimeout: 0,
  },
  generateBuildId: async () => "skip-static",
  trailingSlash: false,
  outputFileTracing: false,
  productionBrowserSourceMaps: false,
  optimizeFonts: false,
  compress: false,
};
export default nextConfig;
