import { stringify } from '../util';
import { NoTokenError } from '../errors';

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
    constructor(
        /**
         * A token, usually a Type or InjectionToken
         */
        private _token: Object,

        /**
         * A system-wide unique id.
         */
        private _id: number
    ) {
        if (!_token) {
            throw new NoTokenError();
        }
    }

    /**
     * Returns the key's unique id.
     */
    get id(): number {
        return this._id;
    }

    /**
     * Returns the key's token.
     */
    get token(): Object {
        return this._token
    }

    /**
     * Returns a stringified token.
     */
    get displayName(): string {
        return stringify(this.token);
    }
}