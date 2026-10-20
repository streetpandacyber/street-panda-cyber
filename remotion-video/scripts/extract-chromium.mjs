/**
 * Sandbox/CI fallback browser for Remotion.
 *
 * On a normal machine you do NOT need this — `npx remotion render`
 * automatically downloads Chrome Headless Shell. Some locked-down
 * sandboxes block that download host (storage.googleapis.com), so we ship
 * a Chromium binary via npm (@sparticuz/chromium) instead.
 *
 * Usage (POSIX shells):
 *   eval "$(node scripts/extract-chromium.mjs)"
 *   npx remotion render JMMajiwaPromo renders/jm-panda-promo.mp4
 *
 * It prints `export …` lines for the variable remotion.config.ts reads
 * (REMOTION_BROWSER_EXECUTABLE) plus the shared-library path the bundled
 * Chromium needs on minimal Linux images.
 *
 * The AWS_EXECUTION_ENV shim below makes @sparticuz/chromium extract its
 * bundled shared libraries (al2023/lib) — it only does so automatically on
 * Amazon Linux 2023, and on other minimal images Chromium otherwise fails
 * with "libnspr4.so: cannot open shared object file".
 */
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.AWS_EXECUTION_ENV ??= "AWS_Lambda_nodejs22.x";

// Dynamic import so the env shim above is in place before the package
// inspects the environment at module-evaluation time.
const { default: chromium } = await import("@sparticuz/chromium");

const executablePath = await chromium.executablePath();
const libPath = join(tmpdir(), "al2023", "lib");
const existing = process.env.LD_LIBRARY_PATH;

console.log(`export REMOTION_BROWSER_EXECUTABLE=${executablePath}`);
console.log(
  `export LD_LIBRARY_PATH=${libPath}${existing ? `:${existing}` : ""}`,
);
