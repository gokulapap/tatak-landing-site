import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const [repositoryOwner = "gokulapap", repositoryName = "tatak-landing-site"] =
  (process.env.GITHUB_REPOSITORY ?? "gokulapap/tatak-landing-site").split("/");
const isUserOrOrganizationSite =
  repositoryName.toLowerCase() === `${repositoryOwner.toLowerCase()}.github.io`;
const defaultPagesBasePath = !isUserOrOrganizationSite
  ? `/${repositoryName}`
  : "";
const basePath =
  isGitHubPages
    ? (process.env.GITHUB_PAGES_BASE_PATH ?? defaultPagesBasePath)
    : "";
const siteUrl = isGitHubPages
  ? (process.env.NEXT_PUBLIC_SITE_URL ??
    `https://${repositoryOwner}.github.io${basePath}`)
  : (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");

const nextConfig: NextConfig = {
  ...(isGitHubPages
    ? {
        output: "export",
        basePath,
        assetPrefix: basePath,
        trailingSlash: true,
        images: { unoptimized: true },
        typescript: { tsconfigPath: "tsconfig.pages.json" },
      }
    : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
};

export default nextConfig;
