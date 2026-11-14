"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shapeInnerPath = exports.roundedRectPath = exports.resolvePadding = exports.computeShape = void 0;
/** Padding around the spotlight: uniform number or per-side values. */

/** Resolve a SpotlightPadding to explicit per-side values. */
const resolvePadding = padding => {
  if (typeof padding === 'number') {
    return {
      top: padding,
      right: padding,
      bottom: padding,
      left: padding
    };
  }
  return {
    top: padding?.top ?? 0,
    right: padding?.right ?? 0,
    bottom: padding?.bottom ?? 0,
    left: padding?.left ?? 0
  };
};

/**
 * Internal type for border radius — number for uniform, object for per-corner.
 * Users specify this via `targetStyle` (auto-extracted) or `spotlightBorderRadius` (number override).
 */

// --- Result types ---
exports.resolvePadding = resolvePadding;
// --- Rect bounds computation ---

const computeRectBounds = (target, padding) => ({
  x: target.x - padding.left,
  y: target.y - padding.top,
  width: target.width + padding.left + padding.right,
  height: target.height + padding.top + padding.bottom
});

/**
 * SVG subpath for a uniformly-rounded rectangle (clockwise, closed). Used for
 * the spotlight cutout and for kept spotlights.
 */
const roundedRectPath = (x, y, w, h, r) => {
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  if (rr <= 0) return `M${x},${y} H${x + w} V${y + h} H${x} Z`;
  return `M${x + rr},${y} H${x + w - rr} A${rr},${rr} 0 0 1 ${x + w},${y + rr} ` + `V${y + h - rr} A${rr},${rr} 0 0 1 ${x + w - rr},${y + h} ` + `H${x + rr} A${rr},${rr} 0 0 1 ${x},${y + h - rr} ` + `V${y + rr} A${rr},${rr} 0 0 1 ${x + rr},${y} Z`;
};

/** The inner (hole) subpath for any shape result. */
exports.roundedRectPath = roundedRectPath;
const shapeInnerPath = result => result.kind === 'path' ? result.d : roundedRectPath(result.x, result.y, result.width, result.height, result.rx);

// --- Rounded rect with per-corner radii ---
exports.shapeInnerPath = shapeInnerPath;
const computeRoundedRectPath = (x, y, w, h, tl, tr, br, bl) => {
  // Clamp radii so they don't exceed half the smallest dimension
  const maxR = Math.min(w, h) / 2;
  const rtl = Math.min(tl, maxR);
  const rtr = Math.min(tr, maxR);
  const rbr = Math.min(br, maxR);
  const rbl = Math.min(bl, maxR);
  return [`M${x + rtl},${y}`, `L${x + w - rtr},${y}`, rtr > 0 ? `A${rtr},${rtr},0,0,1,${x + w},${y + rtr}` : `L${x + w},${y}`, `L${x + w},${y + h - rbr}`, rbr > 0 ? `A${rbr},${rbr},0,0,1,${x + w - rbr},${y + h}` : `L${x + w},${y + h}`, `L${x + rbl},${y + h}`, rbl > 0 ? `A${rbl},${rbl},0,0,1,${x},${y + h - rbl}` : `L${x},${y + h}`, `L${x},${y + rtl}`, rtl > 0 ? `A${rtl},${rtl},0,0,1,${x + rtl},${y}` : `L${x},${y}`, 'Z'].join(' ');
};

// --- Public API ---

/**
 * Adjust border radius for the larger spotlight bounds.
 * Fully rounded elements (circle/pill) stay fully rounded at the new size.
 * Partially rounded elements keep their exact original radius.
 */
const adjustRadius = (radius, targetWidth, targetHeight, padding) => {
  if (radius <= 0) return 0;
  const minTarget = Math.min(targetWidth, targetHeight);
  // Fully rounded (circle / pill) — stay fully rounded at the larger size
  if (radius >= minTarget / 2) {
    return Math.min(targetWidth + padding * 2, targetHeight + padding * 2) / 2;
  }
  // Partially rounded — keep exact same radius, only bounds grow
  return radius;
};

/**
 * Compute the spotlight shape for a target.
 * Always produces a rounded rectangle matching the target's border radius.
 * Border radii are scaled proportionally so circles stay circular with padding.
 */
const computeShape = (target, padding = 0, customBorderRadius) => {
  const pad = resolvePadding(padding);
  const {
    x,
    y,
    width,
    height
  } = computeRectBounds(target, pad);
  // For radius scaling, treat the average per-axis padding as the uniform
  // equivalent — exact for uniform padding, sensible for per-side.
  const padScale = Math.max((pad.left + pad.right) / 2, (pad.top + pad.bottom) / 2);

  // Per-corner border radius → generate path with individual corner arcs
  if (typeof customBorderRadius === 'object' && customBorderRadius !== null) {
    const {
      topLeft = 0,
      topRight = 0,
      bottomRight = 0,
      bottomLeft = 0
    } = customBorderRadius;

    // Scale each corner
    const sTL = adjustRadius(topLeft, target.width, target.height, padScale);
    const sTR = adjustRadius(topRight, target.width, target.height, padScale);
    const sBR = adjustRadius(bottomRight, target.width, target.height, padScale);
    const sBL = adjustRadius(bottomLeft, target.width, target.height, padScale);

    // If all corners are the same, use rect for smooth animation
    if (sTL === sTR && sTR === sBR && sBR === sBL) {
      return {
        kind: 'rect',
        x,
        y,
        width,
        height,
        rx: sTL,
        ry: sTL
      };
    }

    // Different corners: use path
    const d = computeRoundedRectPath(x, y, width, height, sTL, sTR, sBR, sBL);
    return {
      kind: 'path',
      d,
      bounds: {
        x,
        y,
        width,
        height
      }
    };
  }
  const br = typeof customBorderRadius === 'number' ? customBorderRadius : 12;
  const scaledBr = adjustRadius(br, target.width, target.height, padScale);
  return {
    kind: 'rect',
    x,
    y,
    width,
    height,
    rx: scaledBr,
    ry: scaledBr
  };
};
exports.computeShape = computeShape;
//# sourceMappingURL=shapes.js.map