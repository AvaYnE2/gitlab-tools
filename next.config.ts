import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gitlab.com",
        port: "",
        pathname: "/uploads/-/system/project/avatar/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
