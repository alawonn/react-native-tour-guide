import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
export interface TourTargetProps {
    /** Unique id steps reference via `targetId` */
    id: string;
    children: React.ReactNode;
    /**
     * Style for the wrapper View. Border radius set here is auto-extracted for
     * spotlight shape matching, exactly like a step's `targetStyle`.
     */
    style?: StyleProp<ViewStyle>;
}
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
export declare const TourTarget: React.FC<TourTargetProps>;
//# sourceMappingURL=TourTarget.d.ts.map