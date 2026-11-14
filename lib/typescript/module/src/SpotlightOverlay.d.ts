import React from 'react';
import type { SpotlightMotion, SpotlightStyles, SpotlightTarget } from './types';
import type { SpotlightBorderRadius, SpotlightPadding } from './shapes';
export interface SpotlightOverlayProps {
    target: SpotlightTarget | null;
    /** Uniform number or per-side padding around the spotlight */
    padding?: SpotlightPadding;
    borderRadius?: SpotlightBorderRadius;
    styles?: SpotlightStyles;
    screenWidth: number;
    screenHeight: number;
    animationDuration?: number;
    onBackdropPress?: () => void;
    onSpotlightPress?: () => void;
    /**
     * Leave the spotlight hole touch-transparent so the real element underneath
     * receives taps. Only meaningful when the overlay is NOT inside a Modal
     * (inline overlay mode) — a Modal swallows touches regardless.
     */
    interactive?: boolean;
    /** How the spotlight travels between steps (default: 'morph') */
    motion?: SpotlightMotion;
    /**
     * Keep the (expensive) blur subtree mounted even while the current step has
     * blur disabled, cross-fading its opacity instead of mounting/unmounting at
     * step boundaries — that mount is what caused a visible hitch when moving
     * between blurred and unblurred steps. Set by TourGuideOverlay when any step
     * in the tour enables blur.
     */
    mountBlurLayer?: boolean;
    /**
     * Additional cutout subpaths that stay punched out of the backdrop —
     * spotlights kept lit from earlier steps (`step.keepSpotlight`). Purely
     * visual: press bands and the blur mask only consider the current spotlight.
     */
    keptPaths?: string[];
}
/**
 * Component that creates a spotlight effect with a dark overlay.
 * Supports smooth animated transitions between targets.
 * The spotlight automatically matches the target's shape via border radius.
 * Optionally supports blur and gradient effects if dependencies are installed.
 */
declare const SpotlightOverlay: React.FC<SpotlightOverlayProps>;
export default SpotlightOverlay;
//# sourceMappingURL=SpotlightOverlay.d.ts.map