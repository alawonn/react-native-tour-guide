"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTooltipAccessibilityProps = exports.announceStep = void 0;
var _reactNative = require("react-native");
/**
 * Announce a step change to screen readers (VoiceOver / TalkBack).
 */
const announceStep = (step, stepIndex, totalSteps, config) => {
  const enabled = config?.enableAccessibility !== false;
  if (!enabled) return;
  const prefix = config?.accessibilityLabelPrefix ?? 'Tour guide';

  // Use custom label if provided, otherwise build from title/description
  const label = step.accessibilityLabel ?? `${prefix}, step ${stepIndex + 1} of ${totalSteps}. ${step.title}. ${step.description}`;

  // Small delay to ensure the UI has updated before announcing
  setTimeout(() => {
    // announceForAccessibility is not available on web — use ARIA live regions instead
    if (_reactNative.Platform.OS !== 'web' && typeof _reactNative.AccessibilityInfo.announceForAccessibility === 'function') {
      _reactNative.AccessibilityInfo.announceForAccessibility(label);
    }
  }, 100);
};

/**
 * Build the accessibility label for the tooltip container.
 */
exports.announceStep = announceStep;
const getTooltipAccessibilityProps = (step, stepIndex, totalSteps, config) => {
  const enabled = config?.enableAccessibility !== false;
  if (!enabled) return {};
  const prefix = config?.accessibilityLabelPrefix ?? 'Tour guide';
  return {
    accessible: true,
    accessibilityRole: 'alert',
    accessibilityLabel: step.accessibilityLabel ?? `${prefix}, step ${stepIndex + 1} of ${totalSteps}. ${step.title}. ${step.description}`,
    accessibilityHint: _reactNative.Platform.select({
      ios: 'Swipe right for next step, left for previous',
      android: 'Use the buttons to navigate the tour',
      default: 'Use the buttons to navigate the tour'
    }),
    accessibilityLiveRegion: 'polite'
  };
};
exports.getTooltipAccessibilityProps = getTooltipAccessibilityProps;
//# sourceMappingURL=accessibility.js.map