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
/** True in development. Falls back to NODE_ENV outside React Native (e.g. tests, web SSR). */
export declare const isDev: () => boolean;
/**
 * Print a dev-only warning at most once per unique message.
 * `fix` is appended as a concrete next step for whoever reads the log.
 */
export declare const warnOnce: (message: string, fix?: string) => void;
/** Print a dev-only warning every time (for genuinely per-occurrence problems). */
export declare const warn: (message: string, fix?: string) => void;
/** Test-only: clear the de-duplication cache so each test starts clean. */
export declare const __resetWarnings: () => void;
//# sourceMappingURL=dev.d.ts.map