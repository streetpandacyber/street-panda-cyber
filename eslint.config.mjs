import nextConfig from "eslint-config-next/core-web-vitals";

// Next.js 16 promotes this advisory to an error. The existing data-fetching
// hooks use effects to synchronize remote state, so keep the advisory visible
// while avoiding a behavior-changing refactor during the framework upgrade.
export default nextConfig.map((config) => {
  if ("ignores" in config) return config;

  return {
    ...config,
    rules: {
      ...config.rules,
      "react-hooks/set-state-in-effect": "warn",
    },
  };
});
