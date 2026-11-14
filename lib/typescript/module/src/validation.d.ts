import type { ResolvedTourGuideConfig, TourStep } from './types';
/**
 * Validate tour steps and config in development and report actionable warnings.
 *
 * Every check here corresponds to a mistake that otherwise fails *silently* at
 * runtime — the tour simply does nothing, or shows a centered tooltip with no
 * explanation — which is the hardest class of bug to diagnose from the outside.
 * Runs only in dev; it is a no-op in production builds.
 */
export declare const validateTour: (steps: TourStep[], config?: ResolvedTourGuideConfig) => void;
//# sourceMappingURL=validation.d.ts.map