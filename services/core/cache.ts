
/**
 * ENTERPRISE CACHE LAYER
 * Simulates an in-memory Redis/Memcached layer to speed up read-heavy operations.
 * Implements LRU (Least Recently Used) eviction policy.
 */

class LRUCache<K, V> {
    private capacity: number;
    private cache: Map<K, V>;

    constructor(capacity: number = 100) {
        this.capacity = capacity;
        this.cache = new Map();
    }

    get(key: K): V | undefined {
        if (!this.cache.has(key)) return undefined;
        // Refresh item (delete and re-insert to mark as recently used)
        const value = this.cache.get(key)!;
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }

    put(key: K, value: V): void {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.capacity) {
            // Remove oldest (first item in Map)
            const firstKey = this.cache.keys().next().value;
            if (firstKey) this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }

    clear() {
        this.cache.clear();
    }
}

export const CacheLayer = {
    // Separate caches for different high-frequency entities
    settings: new LRUCache<string, any>(50),
    rates: new LRUCache<string, number>(20),
    userPermissions: new LRUCache<string, any>(200),

    // Generic method to wrap async DB calls with caching
    async wrap<T>(
        cacheName: 'settings' | 'rates' | 'userPermissions', 
        key: string, 
        fetcher: () => Promise<T>
    ): Promise<T> {
        const cache = this[cacheName];
        const cached = cache.get(key);
        
        if (cached) {
            // console.debug(`[Cache Hit] ${cacheName}:${key}`);
            return cached as T;
        }

        // console.debug(`[Cache Miss] ${cacheName}:${key}`);
        const value = await fetcher();
        cache.put(key, value);
        return value;
    },

    invalidate(cacheName: 'settings' | 'rates' | 'userPermissions', key?: string) {
        if (key) {
            this[cacheName].put(key, null); // Effectively remove
        } else {
            this[cacheName].clear();
        }
    }
};
