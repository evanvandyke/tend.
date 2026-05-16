import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  turbopack: {},
  webpack(config, { isServer, nextRuntime }) {
    // Prevent __dirname ReferenceError in Edge Runtime middleware.
    // @serwist/next uses __dirname at module scope; if any trace of it
    // leaks into the edge bundle, it crashes because Edge has no __dirname.
    if (nextRuntime === "edge") {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...config.resolve.alias,
        "@serwist/next": false,
        "@serwist/webpack-plugin": false,
        "@serwist/build": false,
      };
    }
    return config;
  },
};

export default withSerwist(nextConfig);
