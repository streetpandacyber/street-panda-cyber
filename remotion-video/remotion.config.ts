/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

/**
 * Sandbox/CI fallback: when REMOTION_BROWSER_EXECUTABLE is set (see
 * scripts/extract-chromium.mjs), render with that Chromium binary instead
 * of downloading Chrome Headless Shell. On a normal machine the variable
 * is unset and Remotion's default download behaviour applies.
 */
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE;
if (browserExecutable) {
  Config.setBrowserExecutable(browserExecutable);
  // @sparticuz/chromium is a full Chromium build (not Headless Shell),
  // so it needs `--headless=new` rather than `--headless=old`.
  Config.setChromeMode("chrome-for-testing");
}
