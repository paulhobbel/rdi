import { stringify } from '../util';

/**
 * A unique object used for retrieving items from the {@link ReflectiveInjector}.
 *
 * Keys have:
 * - a system-wide unique `id`.
 * - a `token`.
 *
 * ReflectiveKey is used internally by {@link ReflectiveInjector} because its system-wide
 * unique `id` allows the injector to store created objects in a more efficient way.
 *
 * ReflectiveKey should not be created directly. {@link ReflectiveInjector} creates
 * keys automatically when resolving providers.
 */
export class ReflectiveKey {

    constructor(public token: Object, public id: number) {
        if (!token) {
            throw new Error('Token must be defined!');
        }
    }

    /**
     * Returns a stringified token.
     */
    get displayName(): string {
        return stringify(this.token);
    }
}

export class KeyRegistry {
    private static keys = new Map<Object, ReflectiveKey>();

    /**
     * Retrieves a `Key` for a token.
     * @param token - Lookup token
     */
    static get(token: Object): ReflectiveKey {
        if (token instanceof ReflectiveKey) return token;

        if (this.keys.has(token)) {
            return this.keys.get(token)!;
        }

        const key = new ReflectiveKey(token, this.numberOfKeys);
        this.keys.set(token, key);
        return key;
    }

    /**
     * Returns the number of keys registered in the system.
     */
    static get numberOfKeys(): number {
        return this.keys.size;
    }
}
