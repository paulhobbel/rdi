import { ReflectiveKey } from './ReflectiveKey';

/**
 * A registry for all {@link ReflectiveKey}'s.
 * The {@link ReflectiveInjector} uses this registry as global lookup table.
 * 
 * The KeyRegistry should not be used directly. {@link ReflectiveInjector} uses 
 * KeyRegistry itself to store and receive {@link ReflectiveKey}'s
 */
export class KeyRegistry {
    private static keys = new Map<Object, ReflectiveKey>();

    /**
     * Retrieves/creates a `Key` for a token.
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
     * Returns the number of keys registered in the registry.
     */
    static get numberOfKeys(): number {
        return this.keys.size;
    }
}