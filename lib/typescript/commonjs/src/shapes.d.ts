import type { EdgeInsets, SpotlightTarget } from './types';
/** Padding around the spotlight: uniform number or per-side values. */
export type SpotlightPadding = number | Partial<EdgeInsets>;
/** Resolve a SpotlightPadding to explicit per-side values. */
export declare const resolvePadding: (padding: SpotlightPadding | undefined) => EdgeInsets;
/**
 * Internal type for border radius — number for uniform, object for per-corner.
 * Users specify this via `targetStyle` (auto-extracted) or `spotlightBorderRadius` (number override).
 */
export type SpotlightBorderRadius = number | {
    topLeft?: number;
    topRight?: number;
    bottomRight?: number;
    bottomLeft?: number;
};
export interface ShapeBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface RectShapeResult {
    kind: 'rect';
    x: number;
    y: number;
    width: number;
    height: number;
    rx: number;
    ry: number;
}
export interface PathShapeResult {
    kind: 'path';
    d: string;
    bounds: ShapeBounds;
}
export type ShapeResult = RectShapeResult | PathShapeResult;
/**
 * SVG subpath for a uniformly-rounded rectangle (clockwise, closed). Used for
 * the spotlight cutout and for kept spotlights.
 */
export declare const roundedRectPath: (x: number, y: number, w: number, h: number, r: number) => string;
/** The inner (hole) subpath for any shape result. */
export declare const shapeInnerPath: (result: ShapeResult) => string;
/**
 * Compute the spotlight shape for a target.
 * Always produces a rounded rectangle matching the target's border radius.
 * Border radii are scaled proportionally so circles stay circular with padding.
 */
export declare const computeShape: (target: SpotlightTarget, padding?: SpotlightPadding, customBorderRadius?: SpotlightBorderRadius) => ShapeResult;
//# sourceMappingURL=shapes.d.ts.map