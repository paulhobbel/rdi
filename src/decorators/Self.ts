import { makeParamDecorator } from '../util';

/**
 * Type of the Self decorator / constructor function.
 */
export interface SelfDecorator {
    /**
     * Specifies that an {@link Injector} should retrieve a dependency only from itself.
     * @example
     * ```
     * @Injectable()
     * class Car {
     *   constructor(@Self() public engine:Engine) {}
     * }
     * ```
     */
    (): any;
    new(): Self;
}

/**
 * Type of the Self metadata.
 */
export interface Self { }

/**
 * Self decorator and metadata.
 */
export const Self: SelfDecorator = makeParamDecorator('Self');