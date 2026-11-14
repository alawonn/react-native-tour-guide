"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTourEvents = void 0;
/**
 * Events emitted over the tour's lifecycle, with their payloads.
 * Subscribe via `useTourGuide().events.on(...)` — the subscription-based
 * alternative to config callbacks, built for analytics: attach once at app
 * root instead of threading onTourStart/onStepChange through every config.
 */

/** The public subscription surface exposed on the context as `events`. */

/** @internal The provider-side emitter (public surface + emit). */

/**
 * A tiny dependency-free emitter. A throwing handler is isolated — analytics
 * code must never be able to take the tour down.
 * @internal
 */
const createTourEvents = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlers = new Map();
  const on = (event, handler) => {
    let set = handlers.get(event);
    if (!set) {
      set = new Set();
      handlers.set(event, set);
    }
    set.add(handler);
    return () => off(event, handler);
  };
  const off = (event, handler) => {
    handlers.get(event)?.delete(handler);
  };
  const emit = (event, payload) => {
    const set = handlers.get(event);
    if (!set) return;
    for (const handler of [...set]) {
      try {
        handler(payload);
      } catch {
        // Subscriber errors are the subscriber's problem, not the tour's.
      }
    }
  };
  return {
    on,
    off,
    emit
  };
};
exports.createTourEvents = createTourEvents;
//# sourceMappingURL=events.js.map