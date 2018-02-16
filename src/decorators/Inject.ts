import { makeParamDecorator } from '../util';

/**
 * Type of the Inject decorator / constructor function.
 */
export interface InjectDecorator {
    /**
     * A parameter decorator that specifies a dependency.
     * @example
     * ```
     * @Injectable()
     * class Car {
     *   constructor(@Inject("MyEngine") public engine:Engine) {}
     * }
     * ```
     *
     * When `@Inject()` is not present, {@link Injector} will use the type annotation of the
     * parameter.
     */
    (token: any): any;
    new(token: any): Inject;
}

/**
 * Type of the Inject metadata.
 */
export interface Inject { token: any; }

/**
 * Inject decorator and metadata.
 */
export const Inject: InjectDecorator = makeParamDecorator('Inject', (token: any): Inject => ({ token }));