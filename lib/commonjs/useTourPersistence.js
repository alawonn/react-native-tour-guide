"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useTourPersistence = void 0;
var _react = require("react");
var _TourGuideContext = require("./TourGuideContext.js");
var _storage = require("./storage.js");
var _dev = require("./dev.js");
const STORAGE_PREFIX = '@tour_guide:';

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
const useTourPersistence = storage => {
  const tourGuide = (0, _TourGuideContext.useTourGuide)();
  // No adapter passed → auto-detect MMKV or AsyncStorage (memory fallback with
  // a dev warning when neither is installed).
  const resolved = storage ?? (0, _storage.detectStorage)().adapter;
  const storageRef = (0, _react.useRef)(resolved);
  storageRef.current = resolved;

  // Stable ref to the underlying startTour to avoid re-creating our wrapper on every render
  const startTourRef = (0, _react.useRef)(tourGuide.startTour);
  startTourRef.current = tourGuide.startTour;

  /**
   * Check if a tour has been completed
   */
  const isTourCompleted = (0, _react.useCallback)(async tourId => {
    try {
      const value = await storageRef.current.getItem(`${STORAGE_PREFIX}${tourId}`);
      return value === 'completed';
    } catch (error) {
      // A storage backend that is unavailable (not yet initialised, quota, web
      // private mode) must not decide whether the user sees the tour, and must
      // not reject into the caller. Treat "unknown" as "not completed".
      (0, _dev.warn)(`Could not read tour state for "${tourId}" from storage: ${String(error)}. Treating the tour as not yet completed.`, 'Check that the storage adapter is initialised before calling startTour().');
      return false;
    }
  }, []);

  /**
   * Mark a tour as completed
   */
  const markCompleted = (0, _react.useCallback)(async tourId => {
    try {
      await storageRef.current.setItem(`${STORAGE_PREFIX}${tourId}`, 'completed');
    } catch (error) {
      (0, _dev.warn)(`Could not persist completion of tour "${tourId}": ${String(error)}. The tour will show again next launch.`, 'Check that the storage adapter is writable.');
    }
  }, []);

  /**
   * Reset a tour so it shows again
   */
  const resetTour = (0, _react.useCallback)(async tourId => {
    try {
      await storageRef.current.removeItem(`${STORAGE_PREFIX}${tourId}`);
    } catch (error) {
      (0, _dev.warn)(`Could not reset tour "${tourId}": ${String(error)}.`, 'Check that the storage adapter supports removeItem().');
    }
  }, []);

  /**
   * Start a tour only if it hasn't been completed.
   * Automatically marks the tour as completed when finished.
   * Requires `config.tourId` to be set.
   *
   * @param force - If true, show the tour even if previously completed
   * @returns true if the tour was started, false if it was skipped
   */
  const startTour = (0, _react.useCallback)(async (steps, config, force = false) => {
    const tourId = config?.tourId;
    if (!tourId) {
      (0, _dev.warn)('useTourPersistence.startTour() was called without config.tourId, so the tour cannot be remembered and will show every time.', "Pass a stable id: startTour(steps, { tourId: 'onboarding' }).");
      startTourRef.current(steps, config);
      return true;
    }

    // Check if already completed
    if (!force) {
      const completed = await isTourCompleted(tourId);
      if (completed) return false;
    }

    // Wrap onTourEnd to mark as completed
    const originalOnTourEnd = config?.onTourEnd;
    const enhancedConfig = {
      ...config,
      onTourEnd: completed => {
        if (completed) {
          // Fire-and-forget, but never as an unhandled rejection: markCompleted
          // already swallows and reports storage failures.
          void markCompleted(tourId);
        }
        originalOnTourEnd?.(completed);
      }
    };
    startTourRef.current(steps, enhancedConfig);
    return true;
  }, [isTourCompleted, markCompleted]);
  return {
    ...tourGuide,
    startTour,
    isTourCompleted,
    resetTour,
    markCompleted
  };
};
exports.useTourPersistence = useTourPersistence;
//# sourceMappingURL=useTourPersistence.js.map