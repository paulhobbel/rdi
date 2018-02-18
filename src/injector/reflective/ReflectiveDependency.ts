import { ReflectiveKey } from '../ReflectiveKey';
import { KeyRegistry } from '../KeyRegistry';
import { Self, SkipSelf } from '../../decorators';

export class ReflectiveDependency {
    constructor(
        /**
         * A key, usually a `Type<any>`.
         */
        public key: ReflectiveKey,

        /**
         * Whether this dependency is optional.
         */
        public optional: boolean,

        /**
         * Whether this dependency is visible.
         */
        public visibility: Self | SkipSelf | null) { }

    static fromKey(key: ReflectiveKey): ReflectiveDependency {
        return new ReflectiveDependency(key, false, null);
    }

    static fromToken(token: any, optional: boolean, visibility: Self | SkipSelf | null) {
        return new ReflectiveDependency(KeyRegistry.get(token), optional, visibility);
    }
}