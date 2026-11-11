/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import path from "node:path";

const e2e = process.env.STC_E2E === "1";
if (e2e && (!process.env.E2E_CONTROL_TOKEN || process.env.VERCEL)) {
  throw new Error("El harness E2E solo puede ejecutarse localmente desde Playwright.");
}

/** @type {import("next").NextConfig} */
const config = {
  distDir: e2e ? ".next-e2e" : ".next",
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config, { webpack }) {
    if (e2e) {
      const fixture = (/** @type {string} */ file) => path.resolve(`src/app/tests/e2e/harness/${file}`);
      Object.assign(config.resolve.alias, {
        "@clerk/nextjs$": fixture("clerk-client.tsx"),
        "@clerk/nextjs/server$": fixture("clerk-server.ts"),
        "@/trpc/server$": fixture("api.tsx"),
        "@/server/db$": fixture("blocked-db.ts"),
      });
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/(?:^@\/trpc\/server$|[\\/]src[\\/]trpc[\\/]server(?:\.tsx?)?$)/, fixture("api.tsx")),
        new webpack.NormalModuleReplacementPlugin(/(?:^@\/server\/db$|[\\/]src[\\/]server[\\/]db(?:[\\/]index\.ts)?$)/, fixture("blocked-db.ts")),
      );
    }
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((/** @type {{ test?: { test?: (value: string) => boolean } }} */ rule) =>
      rule.test?.test?.(".svg"),
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ["@svgr/webpack"],
      },
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};

export default config;
