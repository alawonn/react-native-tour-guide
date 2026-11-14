import type { TourStorage } from './types';
/** How persistence storage was resolved. */
export type StorageType = 'mmkv' | 'async-storage' | 'memory' | 'custom';
/**
 * Detect an available storage backend for tour persistence.
 * Priority: MMKV (fastest) → AsyncStorage → in-memory fallback.
 * The result is cached; the adapters are only probed once.
 */
export declare const detectStorage: () => {
    type: StorageType;
    adapter: TourStorage;
};
/** Test-only: clear the detection cache. */
export declare const __resetStorageCache: () => void;
//# sourceMappingURL=storage.d.ts.map