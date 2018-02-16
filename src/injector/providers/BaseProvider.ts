import { Type } from '../../Type';
import { InjectionToken } from '../InjectionToken';

/**
 * BaseProvider for other provider types
 */
export interface BaseProvider<T> {
    /**
     * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
     */
    provide: Type<T> | InjectionToken<T> | any;

    /**
     * If true, then injector returns an array of instances. This is useful to allow multiple
     * providers spread across many files to provide configuration information to a common token.
     */
    multi?: boolean;
}

export { Type, InjectionToken }