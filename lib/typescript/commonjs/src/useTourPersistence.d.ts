import type { TourStorage, TourStep, TourGuideConfig } from './types';
/**
 * Hook that adds "show only once" persistence to tours.
 * Wraps `startTour` to check if a tour has been completed before,
 * and automatically marks tours as completed when they finish.
 *
 * @param storage - Optional storage adapter. When omitted, MMKV or
 * AsyncStorage is auto-detected (in that order); with neither installed, an
 * in-memory fallback is used and a dev warning explains persistence won't
 * survive restarts.
 *
 * @example
 * ```tsx
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 * import { useTourPersistence } from '@wrack/react-native-tour-guide';
 *
 * const { startTour, resetTour, isTourCompleted } = useTourPersistence(AsyncStorage);
 *
 * // Only shows the tour if user hasn't seen it before
 * startTour(steps, { tourId: 'onboarding' });
 *
 * // Force show again
 * await resetTour('onboarding');
 * startTour(steps, { tourId: 'onboarding' });
 * ```
 */
export declare const useTourPersistence: (storage?: TourStorage) => {
    startTour: (steps: TourStep[], config?: TourGuideConfig, force?: boolean) => Promise<boolean>;
    isTourCompleted: (tourId: string) => Promise<boolean>;
    resetTour: (tourId: string) => Promise<void>;
    markCompleted: (tourId: string) => Promise<void>;
    currentStep: number;
    isActive: boolean;
    isPaused: boolean;
    activeTourId?: string;
    steps: TourStep[];
    activeSteps: TourStep[];
    config?: import("./types").ResolvedTourGuideConfig;
    defineTour: (tourId: string, steps: TourStep[], config?: TourGuideConfig) => void;
    removeTour: (tourId: string) => void;
    canStartTour: (tourOrSteps: string | TourStep[]) => boolean;
    nextStep: () => void;
    prevStep: () => void;
    skipTour: () => void;
    endTour: () => void;
    goToStep: (index: number) => void;
    pauseTour: () => void;
    resumeTour: () => void;
    setStepCompleted: (stepId: string, completed: boolean) => void;
    registerTarget: (id: string, ref: import("./types").MeasurableRef, style?: import("react-native").StyleProp<import("react-native").ViewStyle>) => void;
    unregisterTarget: (id: string, ref?: import("./types").MeasurableRef) => void;
    getTarget: (id: string) => import("./types").RegisteredTarget | undefined;
    setTargetLayout: (layout: import("./types").SpotlightTarget | null) => void;
    targetLayout: import("./types").SpotlightTarget | null;
    events: import("./events").TourEvents;
    __reportScroll?: (y: number) => void;
    __reportScrollEnd?: () => void;
    __subscribeScroll?: (cb: (y: number) => void) => () => void;
    __subscribeScrollEnd?: (cb: () => void) => () => void;
    __getTrackedScrollY?: () => number | undefined;
    __registerOverlay?: () => () => void;
};
//# sourceMappingURL=useTourPersistence.d.ts.map