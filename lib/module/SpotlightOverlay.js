"use strict";

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Animated, Pressable, Dimensions } from 'react-native';
import Svg, { Rect, Path, Defs, Mask } from 'react-native-svg';
import { computeShape, roundedRectPath } from "./shapes.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const DEFAULT_SPOTLIGHT_STYLES = {};

// Resolve optional dependencies once at module scope

let _resolvedBlur;
let _resolvedLinearGradient;
let _resolvedMaskedView;
const getBlurProvider = () => {
  if (_resolvedBlur === undefined) {
    _resolvedBlur = null;
    try {
      const community = require('@react-native-community/blur').BlurView;
      if (community) _resolvedBlur = {
        Component: community,
        kind: 'community'
      };
    } catch {
      // fall through to expo-blur
    }
    if (!_resolvedBlur) {
      try {
        // expo-blur ships inside Expo Go, so blur works there without a dev build.
        const expo = require('expo-blur').BlurView;
        if (expo) _resolvedBlur = {
          Component: expo,
          kind: 'expo'
        };
      } catch {
        _resolvedBlur = null;
      }
    }
  }
  return _resolvedBlur;
};
const getLinearGradient = () => {
  if (_resolvedLinearGradient === undefined) {
    try {
      _resolvedLinearGradient = require('react-native-linear-gradient').default;
    } catch {
      _resolvedLinearGradient = null;
    }
  }
  return _resolvedLinearGradient;
};
const getMaskedView = () => {
  if (_resolvedMaskedView === undefined) {
    try {
      _resolvedMaskedView = require('@react-native-masked-view/masked-view').default;
    } catch {
      _resolvedMaskedView = null;
    }
  }
  return _resolvedMaskedView;
};
let maskIdCounter = 0;
/**
 * Component that creates a spotlight effect with a dark overlay.
 * Supports smooth animated transitions between targets.
 * The spotlight automatically matches the target's shape via border radius.
 * Optionally supports blur and gradient effects if dependencies are installed.
 */
const SpotlightOverlay = ({
  target,
  padding = 0,
  borderRadius: customBorderRadius,
  styles = DEFAULT_SPOTLIGHT_STYLES,
  screenWidth,
  screenHeight,
  animationDuration = 300,
  onBackdropPress,
  onSpotlightPress,
  interactive = false,
  motion = 'morph',
  mountBlurLayer = false,
  keptPaths
}) => {
  const {
    overlayOpacity = 0.6,
    overlayColor = 'black',
    blurAmount = 4,
    enableBlur = false,
    enableGradient = false,
    gradientColors = ['rgba(217,217,217,0)', 'rgba(19,32,14,0.64)'],
    enablePulse = false,
    pulseColor = '#FFFFFF',
    pulseWidth = 2,
    pulseDuration = 1500,
    pulseMinOpacity = 0.2,
    pulseMaxOpacity = 0.8,
    maskPath,
    blurTarget
  } = styles;

  // Unique mask IDs per instance to avoid SVG conflicts
  const maskIds = useRef({
    inverse: `inverse-mask-${++maskIdCounter}`,
    spotlight: `spotlight-mask-${maskIdCounter}`
  }).current;

  // Animated values for smooth spotlight transitions
  const animX = useRef(new Animated.Value(0)).current;
  const animY = useRef(new Animated.Value(0)).current;
  const animWidth = useRef(new Animated.Value(0)).current;
  const animHeight = useRef(new Animated.Value(0)).current;
  const animRx = useRef(new Animated.Value(0)).current;
  const animRy = useRef(new Animated.Value(0)).current;
  const hasAnimated = useRef(false);
  const pulseOpacity = useRef(new Animated.Value(0)).current;
  // Whole-overlay opacity used by the 'fade' motion preset.
  const overlayFade = useRef(new Animated.Value(1)).current;
  // Blur layer cross-fade (used with mountBlurLayer): fading beats remounting.
  const blurFade = useRef(new Animated.Value(enableBlur ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(blurFade, {
      toValue: enableBlur ? 1 : 0,
      duration: 220,
      useNativeDriver: true
    }).start();
  }, [enableBlur, blurFade]);
  // Pulse visibility combined with the fade, so the pulse ring dips with the
  // backdrop instead of floating alone during a fade transition.
  const pulseVisible = useRef(Animated.multiply(pulseOpacity, overlayFade)).current;
  // Guards nested animation callbacks against applying a stale shape after a
  // newer step's effect has already run.
  const shapeEpoch = useRef(0);
  // Direct handles to the two SVG paths so per-frame updates go through
  // setNativeProps instead of setState — a React re-render per animation frame
  // is invisible on a flagship and very visible on a low-end Android.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overlayPathRef = useRef(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pulsePathRef = useRef(null);

  // Path data for per-corner border radius shapes
  const [pathD, setPathD] = useState('');

  // Compute shape result synchronously. A user-supplied maskPath overrides the
  // automatic shape with an arbitrary SVG subpath (rendered as a static path;
  // shape animation is skipped for custom paths).
  const shapeResult = useMemo(() => {
    if (!target) return null;
    const auto = computeShape(target, padding, customBorderRadius);
    if (maskPath) {
      const autoBounds = auto.kind === 'rect' ? {
        x: auto.x,
        y: auto.y,
        width: auto.width,
        height: auto.height
      } : auto.bounds;
      try {
        const d = maskPath({
          target,
          bounds: autoBounds,
          screenWidth,
          screenHeight
        });
        if (typeof d === 'string' && d.length > 0) {
          return {
            kind: 'path',
            d,
            bounds: autoBounds
          };
        }
      } catch {
        // A throwing maskPath falls back to the automatic shape.
      }
    }
    return auto;
  }, [target, padding, customBorderRadius, maskPath, screenWidth, screenHeight]);
  const usePathRendering = shapeResult?.kind === 'path';

  // Bounding box for press overlay positioning
  const bounds = useMemo(() => {
    if (!shapeResult) return null;
    if (shapeResult.kind === 'rect') {
      return {
        x: shapeResult.x,
        y: shapeResult.y,
        width: shapeResult.width,
        height: shapeResult.height
      };
    }
    return shapeResult.bounds;
  }, [shapeResult]);

  // Interactive mode: four press bands around the hole catch backdrop touches
  // while the hole itself stays open so taps reach the real element. The
  // rounded corners leave sub-corner-radius slivers touch-transparent —
  // visually part of the backdrop, acceptable.
  const pressBands = useMemo(() => {
    if (!interactive || !bounds) return null;
    return [{
      left: 0,
      top: 0,
      right: 0,
      height: Math.max(0, bounds.y)
    },
    // above
    {
      left: 0,
      top: bounds.y + bounds.height,
      right: 0,
      bottom: 0
    },
    // below
    {
      left: 0,
      top: bounds.y,
      width: Math.max(0, bounds.x),
      height: bounds.height
    },
    // left
    {
      left: bounds.x + bounds.width,
      top: bounds.y,
      right: 0,
      height: bounds.height
    } // right
    ];
  }, [interactive, bounds]);

  // The dark overlay is drawn as a single even-odd path: a full-screen rectangle
  // with the spotlight punched out as a real hole. This replaces an SVG <Mask>,
  // which on the new architecture (Fabric) leaves the cutout partially filled
  // (a white film over the highlighted element) instead of fully transparent.
  const [overlayPathD, setOverlayPathD] = useState('');
  const animVals = useRef({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    rx: 0
  });

  // The overlay Modal is statusBarTranslucent / edge-to-edge, so it spans the
  // full PHYSICAL screen — but `screenWidth`/`screenHeight` come from
  // Dimensions.get('window'), which on Android excludes the status/navigation
  // bars. Sizing the dark backdrop to the window left an undimmed strip at the
  // bottom (under the nav bar). Cover the full screen instead; over-drawing past
  // the Modal bounds is harmless (clipped). iOS: window == screen, so no change.
  const physicalScreen = Dimensions.get('screen');
  const coverWidth = Math.max(screenWidth, physicalScreen.width);
  const coverHeight = Math.max(screenHeight, physicalScreen.height);

  // Kept spotlights from earlier steps are appended as extra holes — the
  // evenodd fill rule punches every subpath out of the full-screen rect.
  const keptSuffix = keptPaths && keptPaths.length > 0 ? ` ${keptPaths.join(' ')}` : '';
  const buildOverlayPath = innerSubpath => `M0,0 H${coverWidth} V${coverHeight} H0 Z ${innerSubpath}${keptSuffix}`;

  // Keep the overlay path in sync with the animated spotlight (rect shapes).
  // Per-corner (path) shapes set the path directly in the animation effect.
  useEffect(() => {
    if (usePathRendering) return undefined;
    // Five listeners (x/y/w/h/rx) fire once each per animation frame; building
    // the path string five times per frame is wasted work. Coalesce to one
    // update per frame via requestAnimationFrame; values are read at flush
    // time, so the last-written values always win.
    let frameScheduled = false;
    const update = () => {
      if (frameScheduled) return;
      if (typeof requestAnimationFrame === 'function') {
        frameScheduled = true;
        requestAnimationFrame(() => {
          frameScheduled = false;
          flushUpdate();
        });
      } else {
        flushUpdate();
      }
    };
    const flushUpdate = () => {
      const v = animVals.current;
      const inner = roundedRectPath(v.x, v.y, v.w, v.h, v.rx);
      // Fast path: write the path data straight to the native SVG nodes. Both
      // the dark hole and the pulse ring are driven from the SAME string here,
      // so they can never drift apart. Falls back to setState when
      // setNativeProps is unavailable (tests, exotic hosts); the final frame is
      // always committed to state when the animation ends.
      const overlayNode = overlayPathRef.current;
      if (overlayNode && typeof overlayNode.setNativeProps === 'function') {
        overlayNode.setNativeProps({
          d: buildOverlayPath(inner)
        });
        const pulseNode = pulsePathRef.current;
        if (pulseNode && typeof pulseNode.setNativeProps === 'function') {
          pulseNode.setNativeProps({
            d: inner
          });
        }
      } else {
        setOverlayPathD(buildOverlayPath(inner));
        setPathD(inner);
      }
    };
    const ix = animX.addListener(({
      value
    }) => {
      animVals.current.x = value;
      update();
    });
    const iy = animY.addListener(({
      value
    }) => {
      animVals.current.y = value;
      update();
    });
    const iw = animWidth.addListener(({
      value
    }) => {
      animVals.current.w = value;
      update();
    });
    const ih = animHeight.addListener(({
      value
    }) => {
      animVals.current.h = value;
      update();
    });
    const ir = animRx.addListener(({
      value
    }) => {
      animVals.current.rx = value;
      update();
    });
    return () => {
      animX.removeListener(ix);
      animY.removeListener(iy);
      animWidth.removeListener(iw);
      animHeight.removeListener(ih);
      animRx.removeListener(ir);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usePathRendering, screenWidth, screenHeight, animX, animY, animWidth, animHeight, animRx, keptSuffix]);

  // Animation effect
  useEffect(() => {
    if (!shapeResult) return;
    const epoch = ++shapeEpoch.current;

    // Snap every animated value + both state paths to a rect result at once.
    const applyRectImmediate = r => {
      animX.setValue(r.x);
      animY.setValue(r.y);
      animWidth.setValue(r.width);
      animHeight.setValue(r.height);
      animRx.setValue(r.rx);
      animRy.setValue(r.ry);
      animVals.current = {
        x: r.x,
        y: r.y,
        w: r.width,
        h: r.height,
        rx: r.rx
      };
      const inner = roundedRectPath(r.x, r.y, r.width, r.height, r.rx);
      setOverlayPathD(buildOverlayPath(inner));
      // Same source as the dark hole — keeps the pulse border in lockstep.
      setPathD(inner);
    };
    if (shapeResult.kind === 'path') {
      // Path shapes (per-corner radius / custom maskPath): applied immediately —
      // arbitrary paths can't be tweened reliably, so they jump. Restore the
      // fade opacity in case an interrupted 'fade' left it near 0.
      overlayFade.stopAnimation();
      overlayFade.setValue(1);
      const b = shapeResult.bounds;
      animX.setValue(b.x);
      animY.setValue(b.y);
      animWidth.setValue(b.width);
      animHeight.setValue(b.height);
      setPathD(shapeResult.d);
      setOverlayPathD(buildOverlayPath(shapeResult.d));
      hasAnimated.current = true;
      return;
    }

    // Rect shapes: first target always snaps into place (nothing to move from).
    if (!hasAnimated.current || motion === 'none') {
      overlayFade.stopAnimation();
      overlayFade.setValue(1);
      applyRectImmediate(shapeResult);
      hasAnimated.current = true;
      return;
    }

    // 'fade': dip the whole overlay out, jump the hole, fade back in.
    // Halves scale with animationDuration (default 300ms ≈ the old 140/180).
    if (motion === 'fade') {
      Animated.timing(overlayFade, {
        toValue: 0,
        duration: Math.max(60, animationDuration * 0.45),
        useNativeDriver: true
      }).start(() => {
        // A newer step took over mid-dip: it either runs its own fade from the
        // current opacity, or its branch restores opacity itself — never leave
        // the overlay stuck invisible.
        if (epoch !== shapeEpoch.current) return;
        applyRectImmediate(shapeResult);
        Animated.timing(overlayFade, {
          toValue: 1,
          duration: Math.max(80, animationDuration * 0.55),
          useNativeDriver: true
        }).start();
      });
      return;
    }

    // 'morph' / 'bounce' below never touch overlayFade during the move, so make
    // sure an interrupted fade can't leave the backdrop invisible.
    overlayFade.stopAnimation();
    overlayFade.setValue(1);

    // 'morph' (timing) / 'bounce' (spring): animate position, size and radius.
    const animate = motion === 'bounce' ? (value, toValue) => Animated.spring(value, {
      toValue,
      friction: 7,
      tension: 90,
      useNativeDriver: false
    }) : (value, toValue) => Animated.timing(value, {
      toValue,
      duration: animationDuration,
      useNativeDriver: false
    });
    Animated.parallel([animate(animX, shapeResult.x), animate(animY, shapeResult.y), animate(animWidth, shapeResult.width), animate(animHeight, shapeResult.height), animate(animRx, shapeResult.rx), animate(animRy, shapeResult.ry)]).start(({
      finished
    }) => {
      // Commit the final frame to React state so a later unrelated re-render
      // can't paint a stale path from before the setNativeProps fast path.
      if (finished && epoch === shapeEpoch.current) {
        applyRectImmediate(shapeResult);
      }
    });
    // keptSuffix is intentionally NOT a dep: a kept-paths change must repaint
    // the path (separate effect below), not replay the whole step transition —
    // with 'fade' that replay double-blinked the backdrop on every
    // keepSpotlight step change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapeResult, motion, animX, animY, animWidth, animHeight, animRx, animRy, animationDuration, overlayFade]);

  // Repaint-only path for kept-hole changes: rebuild the overlay path from the
  // CURRENT inner subpath with the new kept suffix, without touching the
  // animated values or the transition.
  useEffect(() => {
    if (pathD) setOverlayPathD(buildOverlayPath(pathD));
    // buildOverlayPath closes over keptSuffix; pathD is the current inner.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keptSuffix]);

  // Pulse animation
  useEffect(() => {
    if (!enablePulse || !target) {
      pulseOpacity.setValue(0);
      return;
    }
    const halfDuration = pulseDuration / 2;
    const loop = Animated.loop(Animated.sequence([Animated.timing(pulseOpacity, {
      toValue: pulseMaxOpacity,
      duration: halfDuration,
      useNativeDriver: true
    }), Animated.timing(pulseOpacity, {
      toValue: pulseMinOpacity,
      duration: halfDuration,
      useNativeDriver: true
    })]));
    loop.start();
    return () => loop.stop();
  }, [enablePulse, target, pulseDuration, pulseMinOpacity, pulseMaxOpacity, pulseOpacity]);

  // No target (centered / no-spotlight step, or the measurement gap between
  // steps): the screen stays dimmed and the press handler available. Kept
  // spotlights (keepSpotlight) must survive this branch too — a plain solid
  // backdrop made accumulated holes vanish on centered steps and blink off
  // between steps.
  if (!target || !shapeResult || !bounds) {
    if (keptPaths && keptPaths.length > 0) {
      const w = Math.max(screenWidth, Dimensions.get('screen').width);
      const h = Math.max(screenHeight, Dimensions.get('screen').height);
      const d = `M0,0 H${w} V${h} H0 Z ${keptPaths.join(' ')}`;
      return /*#__PURE__*/_jsx(View, {
        style: StyleSheet.absoluteFill,
        pointerEvents: "box-none",
        children: /*#__PURE__*/_jsx(Pressable, {
          style: StyleSheet.absoluteFill,
          onPress: onBackdropPress,
          children: /*#__PURE__*/_jsx(Svg, {
            height: h,
            width: w,
            style: StyleSheet.absoluteFill,
            children: /*#__PURE__*/_jsx(Path, {
              d: d,
              fill: overlayColor,
              fillOpacity: overlayOpacity,
              fillRule: "evenodd"
            })
          })
        })
      });
    }
    return /*#__PURE__*/_jsx(Pressable, {
      style: [StyleSheet.absoluteFill, {
        backgroundColor: overlayColor,
        opacity: overlayOpacity
      }],
      onPress: onBackdropPress
    });
  }

  // Resolve optional libraries (cached at module scope)
  const wantsBlurLayer = enableBlur || mountBlurLayer;
  const blurProvider = wantsBlurLayer ? getBlurProvider() : null;
  const LinearGradient = enableGradient ? getLinearGradient() : null;
  const MaskedView = wantsBlurLayer && blurProvider ? getMaskedView() : null;

  // --- Cutout shape rendering helpers ---
  const renderRectCutout = (fill, stroke, sw) => /*#__PURE__*/_jsx(AnimatedRect, {
    x: animX,
    y: animY,
    width: animWidth,
    height: animHeight,
    rx: animRx,
    ry: animRy,
    fill: fill,
    stroke: stroke,
    strokeWidth: sw
  });
  const renderPathCutout = (fill, stroke, sw) => /*#__PURE__*/_jsx(Path, {
    d: pathD,
    fill: fill,
    stroke: stroke,
    strokeWidth: sw
  });
  const renderCutout = (fill, stroke, sw) => usePathRendering ? renderPathCutout(fill, stroke, sw) : renderRectCutout(fill, stroke, sw);

  // Optional masked blur/gradient backdrop — shared by both render branches so
  // interactive steps keep the same backdrop styling as everything else.
  const renderBlurLayer = () => wantsBlurLayer && blurProvider && MaskedView ? /*#__PURE__*/_jsx(Animated.View, {
    style: [StyleSheet.absoluteFill, {
      opacity: blurFade
    }],
    pointerEvents: "none",
    children: /*#__PURE__*/_jsxs(MaskedView, {
      style: StyleSheet.absoluteFill,
      maskElement: /*#__PURE__*/_jsxs(Svg, {
        height: coverHeight,
        width: coverWidth,
        children: [/*#__PURE__*/_jsx(Defs, {
          children: /*#__PURE__*/_jsxs(Mask, {
            id: maskIds.inverse,
            children: [/*#__PURE__*/_jsx(Rect, {
              x: "0",
              y: "0",
              width: coverWidth,
              height: coverHeight,
              fill: "white"
            }), renderCutout('black')]
          })
        }), /*#__PURE__*/_jsx(Rect, {
          x: "0",
          y: "0",
          width: coverWidth,
          height: coverHeight,
          fill: "black",
          mask: `url(#${maskIds.inverse})`
        })]
      }),
      children: [blurProvider.kind === 'community' ? /*#__PURE__*/_jsx(blurProvider.Component, {
        style: StyleSheet.absoluteFill,
        blurType: "light",
        blurAmount: blurAmount,
        reducedTransparencyFallbackColor: "white"
      }) :
      /*#__PURE__*/
      // expo-blur: real blur on iOS out of the box. On Android real blur
      // additionally needs spotlightStyles.blurTarget (a ref to an
      // expo-blur BlurTargetView wrapping the app content); without it,
      // Android degrades to a soft tint.
      _jsx(blurProvider.Component, {
        style: StyleSheet.absoluteFill,
        intensity: Math.min(100, blurAmount * 2),
        tint: "light",
        ...(blurTarget ? {
          blurTarget,
          blurMethod: 'dimezisBlurView'
        } : {})
      }), enableGradient && LinearGradient ? /*#__PURE__*/_jsx(LinearGradient, {
        colors: gradientColors,
        start: {
          x: 0.5,
          y: 0
        },
        end: {
          x: 0.5,
          y: 1
        },
        style: StyleSheet.absoluteFill
      }) : null]
    })
  }) : null;
  if (pressBands) {
    return /*#__PURE__*/_jsxs(View, {
      style: StyleSheet.absoluteFill,
      pointerEvents: "box-none",
      children: [/*#__PURE__*/_jsxs(Animated.View, {
        style: [StyleSheet.absoluteFill, {
          opacity: overlayFade
        }],
        pointerEvents: "none",
        children: [renderBlurLayer(), /*#__PURE__*/_jsx(Svg, {
          height: coverHeight,
          width: coverWidth,
          style: StyleSheet.absoluteFill,
          children: /*#__PURE__*/_jsx(Path, {
            ref: overlayPathRef,
            d: overlayPathD,
            fill: overlayColor,
            fillOpacity: overlayOpacity,
            fillRule: "evenodd"
          })
        }), enablePulse ? /*#__PURE__*/_jsx(Animated.View, {
          style: [StyleSheet.absoluteFill, {
            opacity: pulseVisible
          }],
          pointerEvents: "none",
          children: /*#__PURE__*/_jsx(Svg, {
            height: coverHeight,
            width: coverWidth,
            children: /*#__PURE__*/_jsx(Path, {
              ref: pulsePathRef,
              d: pathD,
              fill: "none",
              stroke: pulseColor,
              strokeWidth: pulseWidth
            })
          })
        }) : null]
      }), pressBands.map((band, i) => /*#__PURE__*/_jsx(Pressable, {
        style: [{
          position: 'absolute'
        }, band],
        onPress: onBackdropPress,
        accessibilityElementsHidden: true,
        importantForAccessibility: "no-hide-descendants"
      }, `band-${i}`))]
    });
  }
  return /*#__PURE__*/_jsxs(View, {
    style: StyleSheet.absoluteFill,
    pointerEvents: "box-none",
    children: [/*#__PURE__*/_jsxs(Pressable, {
      style: StyleSheet.absoluteFill,
      onPress: onBackdropPress,
      children: [renderBlurLayer(), /*#__PURE__*/_jsx(Animated.View, {
        style: [StyleSheet.absoluteFill, {
          opacity: overlayFade
        }],
        pointerEvents: "none",
        children: /*#__PURE__*/_jsx(Svg, {
          height: coverHeight,
          width: coverWidth,
          style: StyleSheet.absoluteFill,
          children: /*#__PURE__*/_jsx(Path, {
            ref: overlayPathRef,
            d: overlayPathD,
            fill: overlayColor,
            fillOpacity: overlayOpacity,
            fillRule: "evenodd"
          })
        })
      })]
    }), enablePulse ? /*#__PURE__*/_jsx(Animated.View, {
      style: [StyleSheet.absoluteFill, {
        opacity: pulseVisible
      }],
      pointerEvents: "none",
      children: /*#__PURE__*/_jsx(Svg, {
        height: coverHeight,
        width: coverWidth,
        children: /*#__PURE__*/_jsx(Path, {
          ref: pulsePathRef,
          d: pathD,
          fill: "none",
          stroke: pulseColor,
          strokeWidth: pulseWidth
        })
      })
    }) : null, onSpotlightPress ? /*#__PURE__*/_jsx(Pressable, {
      style: {
        position: 'absolute',
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height
      },
      onPress: onSpotlightPress
    }) : null]
  });
};
export default SpotlightOverlay;
//# sourceMappingURL=SpotlightOverlay.js.map