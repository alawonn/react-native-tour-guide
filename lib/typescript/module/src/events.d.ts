import type { TourStep } from './types';
/**
 * Events emitted over the tour's lifecycle, with their payloads.
 * Subscribe via `useTourGuide().events.on(...)` — the subscription-based
 * alternative to config callbacks, built for analytics: attach once at app
 * root instead of threading onTourStart/onStepChange through every config.
 */
export interface TourEventMap {
    /** A tour started */
    start: {
        tourId?: string;
        totalSteps: number;
    };
    /** The step changed (next, back, or a goToStep jump). `to` is the new index. */
    stepChange: {
        from: number;
        to: number;
        step?: TourStep;
    };
    /** The tour ended — completed=true when the user finished the last step */
    end: {
        completed: boolean;
        tourId?: string;
    };
    /** The user skipped the tour (an `end` with completed=false follows) */
    skip: {
        at: number;
    };
    /** The tour was paused */
    pause: {
        at: number;
    };
    /** The tour was resumed */
    resume: {
        at: number;
    };
}
export type TourEventName = keyof TourEventMap;
export type TourEventHandler<K extends TourEventName> = (payload: TourEventMap[K]) => void;
/** The public subscription surface exposed on the context as `events`. */
export interface TourEvents {
    /** Subscribe. Returns an unsubscribe function. */
    on<K extends TourEventName>(event: K, handler: TourEventHandler<K>): () => void;
    /** Remove a previously added handler. */
    off<K extends TourEventName>(event: K, handler: TourEventHandler<K>): void;
}
/** @internal The provider-side emitter (public surface + emit). */
export interface TourEventsInternal extends TourEvents {
    emit<K extends TourEventName>(event: K, payload: TourEventMap[K]): void;
}
/**
 * A tiny dependency-free emitter. A throwing handler is isolated — analytics
 * code must never be able to take the tour down.
 * @internal
 */
export declare const createTourEvents: () => TourEventsInternal;
//# sourceMappingURL=events.d.ts.map