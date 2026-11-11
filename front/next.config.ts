import type { NextConfig } from "next";

const storageHost = process.env.NEXT_PUBLIC_AZURE_STORAGE_HOST;

if (
  storageHost &&
  !/^[a-z0-9]{3,24}\.blob\.core\.windows\.net$/.test(storageHost)
) {
  throw new Error(
    "NEXT_PUBLIC_AZURE_STORAGE_HOST must be an Azure Blob hostname without protocol or path",
  );
}

const apiUrl = process.env.API_URL?.replace(/\/+$/, "");

if (!apiUrl) {
  throw new Error(
    "Missing environment variable API_URL. Copy front/.env.example to front/.env and fill it in.",
  );
}

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiUrl}/:path*` }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      ...(storageHost
        ? [
            {
              protocol: "https" as const,
              hostname: storageHost,
              port: "",
              pathname: "/images/**",
              search: "",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
