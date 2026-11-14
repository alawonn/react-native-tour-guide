import type { EdgeInsets, MeasurableRef, PerPlatform, ResolvedTourGuideConfig, SpotlightTarget, TourGuideConfig } from './types';
import type { SpotlightBorderRadius } from './shapes';
/**
 * Compute the best tooltip position based on available screen space.
 * Prefers: bottom > top > right > left.
 * `insets` shrink the usable area so the tour avoids system chrome.
 */
interface TooltipPositionOptions {
    target: SpotlightTarget;
    screenWidth: number;
    screenHeight: number;
    tooltipWidth: number;
    tooltipHeight?: number;
    offset?: number;
    insets?: EdgeInsets;
}
export declare const computeTooltipPosition: ({ target, screenWidth, screenHeight, tooltipWidth, tooltipHeight, offset, insets, }: TooltipPositionOptions) => "top" | "bottom" | "left" | "right";
/**
 * Whether an Android app draws edge-to-edge (behind the status bar). That's the
 * default since React Native 0.81 and Expo SDK 54, and also what
 * react-native-edge-to-edge does. Same check as react-native-is-edge-to-edge,
 * inlined to keep the library dependency-free. Always false off Android.
 */
export declare const isAndroidEdgeToEdge: () => boolean;
/**
 * Resolve just the safe-area insets (auto-detected, or overridden via
 * `config.insets`) — WITHOUT any `extraInsets`. This is the value that mirrors
 * system chrome like the status bar, and is what corrects `measureInWindow`
 * coordinates on Android (see TourGuideOverlay).
 */
export declare const resolveSafeAreaInsets: (config?: {
    insets?: Partial<EdgeInsets>;
}) => EdgeInsets;
/**
 * Resolve the effective insets the tour should respect for layout/clamping:
 * the safe area plus any `config.extraInsets` for app chrome like tab bars and
 * headers.
 */
export declare const resolveInsets: (config?: {
    insets?: Partial<EdgeInsets>;
    extraInsets?: Partial<EdgeInsets>;
}) => EdgeInsets;
/**
 * Validate that a ref is valid and points to a mounted component.
 * Returns true if valid, false otherwise.
 */
export declare const validateRef: (ref: MeasurableRef | undefined, stepId: string) => boolean;
/**
 * Extract border radius values from a View style.
 * Returns a SpotlightBorderRadius (number if uniform, object if per-corner),
 * or undefined if no border radius is specified.
 *
 * Percentage radii (e.g. `'50%'`, supported by React Native 0.76+) are resolved
 * against the target's shorter side when `target` dimensions are provided — this
 * is what keeps a circular avatar (`borderRadius: '50%'`) round instead of square.
 * Without `target`, percentages fall back to the numeric base/0.
 */
export declare const extractBorderRadius: (style: any, target?: {
    width: number;
    height: number;
}) => SpotlightBorderRadius | undefined;
/**
 * Scroll a scrollable ref to an absolute Y offset.
 *
 * Consumers pass all kinds of scrollables, and each exposes a different imperative
 * API — assuming `scrollTo` crashes with `scrollTo is not a function` on the most
 * common one (`FlatList`). This normalises across:
 *
 *  - `ScrollView` (and gesture-handler / Animated wrappers) → `scrollTo`
 *  - `FlatList` / `VirtualizedList`                         → `scrollToOffset`
 *  - `SectionList` and other list wrappers                  → `getScrollResponder()` / `getScrollRef()`
 *  - legacy `Animated.ScrollView`                           → `getNode()`
 *  - `KeyboardAwareScrollView`                              → `scrollToPosition`
 *
 * @returns true if a scroll was actually issued, false if the ref exposes no
 * usable scroll method (the caller should then continue without scrolling
 * rather than leaving the tour stuck).
 */
export declare const scrollRefToY: (scrollRef: {
    current: any;
} | null | undefined, y: number, animated: boolean) => boolean;
/**
 * Whether a background color is light (true), dark (false), or unparseable
 * (null). Supports #rgb/#rgba/#rrggbb/#rrggbbaa, rgb()/rgba(), and a handful of
 * common named colors — enough for the tooltip-background use case; anything
 * exotic returns null and callers keep their existing defaults.
 *
 * Used to pick readable default text colors when a consumer sets a custom
 * tooltip background: a pale background used to get the built-in white title
 * text, which is invisible.
 */
export declare const isLightColor: (color: string) => boolean | null;
/**
 * Resolve a possibly per-platform value for the running OS.
 * `{ ios: 12, default: 8 }` → 12 on iOS, 8 elsewhere.
 */
export declare const osValue: <T>(value: PerPlatform<T> | undefined) => T | undefined;
/**
 * Resolve every PerPlatform field of a tour config for the running OS.
 * Called once in startTour, so everything downstream reads plain values.
 */
export declare const resolvePlatformConfig: (config: TourGuideConfig | undefined) => ResolvedTourGuideConfig | undefined;
export {};
//# sourceMappingURL=utils.d.ts.map