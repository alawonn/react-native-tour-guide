"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useTourScroll = void 0;
var _react = require("react");
var _TourGuideContext = require("./TourGuideContext.js");
/**
 * Binds a scrollable to the tour. Wiring this up gives the tour three things:
 *
 * 1. **`followTarget`** — with `config.followTarget: true`, the spotlight and
 *    tooltip stay glued to the target while the user scrolls freely.
 * 2. **Exact auto-scroll settling** — `onMomentumScrollEnd` tells the tour the
 *    programmatic scroll finished, so the highlight lands immediately instead
 *    of waiting for position polling to detect the stop.
 * 3. **A tracked scroll offset** — `getCurrentScrollOffset` becomes redundant;
 *    the tour reads the offset it saw last.
 *
 * Already have your own onScroll? Compose: call both handlers, or spread
 * `scrollProps` and call your handler from a wrapper.
 */
const useTourScroll = () => {
  const {
    __reportScroll,
    __reportScrollEnd
  } = (0, _TourGuideContext.useTourGuide)();
  const onScroll = (0, _react.useCallback)(e => {
    __reportScroll?.(e.nativeEvent.contentOffset.y);
  }, [__reportScroll]);
  const onMomentumScrollEnd = (0, _react.useCallback)(() => {
    __reportScrollEnd?.();
  }, [__reportScrollEnd]);
  const scrollProps = (0, _react.useMemo)(() => ({
    onScroll,
    onMomentumScrollEnd,
    scrollEventThrottle: 16
  }), [onScroll, onMomentumScrollEnd]);
  return {
    scrollProps,
    onScroll,
    onMomentumScrollEnd
  };
};
exports.useTourScroll = useTourScroll;
//# sourceMappingURL=useTourScroll.js.map