"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.warnOnce = exports.warn = exports.isDev = exports.__resetWarnings = void 0;
/**
 * Dev-only diagnostics.
 *
 * Every warning the library emits goes through here so that:
 *  - it is stripped in production builds (`__DEV__` is false), keeping consumer
 *    release logs and crash-reporting breadcrumbs clean;
 *  - it is de-duplicated, so a warning inside a render/measure loop is printed
 *    once instead of on every frame;
 *  - it always carries the package name and an actionable "how to fix" line.
 */

const PREFIX = 'react-native-tour-guide';

/** True in development. Falls back to NODE_ENV outside React Native (e.g. tests, web SSR). */
const isDev = () => typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';
exports.isDev = isDev;
const seen = new Set();

/**
 * Print a dev-only warning at most once per unique message.
 * `fix` is appended as a concrete next step for whoever reads the log.
 */
const warnOnce = (message, fix) => {
  if (!isDev()) return;
  const text = fix ? `${PREFIX}: ${message}\n  → Fix: ${fix}` : `${PREFIX}: ${message}`;
  if (seen.has(text)) return;
  seen.add(text);
  console.warn(text);
};

/** Print a dev-only warning every time (for genuinely per-occurrence problems). */
exports.warnOnce = warnOnce;
const warn = (message, fix) => {
  if (!isDev()) return;
  console.warn(fix ? `${PREFIX}: ${message}\n  → Fix: ${fix}` : `${PREFIX}: ${message}`);
};

/** Test-only: clear the de-duplication cache so each test starts clean. */
exports.warn = warn;
const __resetWarnings = () => seen.clear();
exports.__resetWarnings = __resetWarnings;
//# sourceMappingURL=dev.js.map