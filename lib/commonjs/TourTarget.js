"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TourTarget = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _TourGuideContext = require("./TourGuideContext.js");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Declaratively mark a component as a tour target — the alternative to
 * threading refs into your steps array.
 *
 * Wraps its children in a View (with `collapsable={false}`, so Android's view
 * flattening can never make the target unmeasurable) and registers it with the
 * provider. Steps then reference it by id:
 *
 * @example
 * ```tsx
 * <TourTarget id="compose" style={{ borderRadius: 24 }}>
 *   <ComposeButton />
 * </TourTarget>
 *
 * startTour([{ id: 'step1', targetId: 'compose', title: '…', description: '…' }]);
 * ```
 *
 * The wrapper carries no styles of its own, so layout is unchanged unless you
 * pass `style`. If the target mounts after the tour starts (a later screen),
 * the tour waits briefly for it to register before falling back to a centered
 * tooltip.
 */
const TourTarget = ({
  id,
  children,
  style
}) => {
  const {
    registerTarget,
    unregisterTarget,
    getTarget
  } = (0, _TourGuideContext.useTourGuide)();
  const ref = (0, _react.useRef)(null);

  // Keep the registered style current without re-registering: inline styles get
  // a new identity every render, so re-registering on style change would churn
  // the registry — instead the entry is updated in place, so shape extraction
  // always reads the latest style (e.g. a borderRadius that animates on state).
  (0, _react.useEffect)(() => {
    const entry = getTarget(id);
    if (entry && entry.ref === ref) {
      entry.style = style;
    }
  });
  (0, _react.useEffect)(() => {
    registerTarget(id, ref, style);
    // Pass our ref so an unmounting duplicate never clobbers a still-mounted
    // TourTarget that re-registered the same id.
    return () => unregisterTarget(id, ref);
    // `style` is intentionally not a dep: identity changes every render for
    // inline styles, and re-registering would churn the registry. The style is
    // read through the registry at measure time, so keeping the first
    // registration's reference is fine for shape extraction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, registerTarget, unregisterTarget]);
  return (
    /*#__PURE__*/
    // collapsable={false} — Android flattens layout-only Views, which would
    // leave nothing to measure and silently produce a 0x0 target.
    (0, _jsxRuntime.jsx)(_reactNative.View, {
      ref: ref,
      collapsable: false,
      style: style,
      children: children
    })
  );
};
exports.TourTarget = TourTarget;
//# sourceMappingURL=TourTarget.js.map