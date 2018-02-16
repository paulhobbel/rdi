import { Type } from '../Type';
import { InjectionToken } from './InjectionToken';

const _THROW_IF_NOT_FOUND = new Object();

/**
 * Injector
 */
export abstract class Injector {
    static THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;

    /**
     * Retrieves an instance from the injector based on the provided token.
     * @param token - Token which refers to provider
     * @param notFoundValue - Fallback value
     * @throws Throws an error if `notFoundValue` is not set
     */
    abstract get<T>(token: Type<T> | InjectionToken<T> | Object, notFoundValue?: T): T;
    abstract getAsync<T>(token: Type<T> | InjectionToken<T> | Object, notFoundValue?: T): Promise<Type<T>>;
}