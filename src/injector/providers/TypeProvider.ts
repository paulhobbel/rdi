import { Type } from './BaseProvider';

/**
 * Configures the {@link Injector} to return an instance of `Type` when `Type' is used as token.
 * @example
 * ```
 * @Injectable()
 * class MyService {}
 *
 * const provider: TypeProvider = MyService;
 * ```
 *
 * @description
 * Create an instance by invoking the `new` operator and supplying additional arguments.
 * This form is a short form of `TypeProvider`;
 */
export interface TypeProvider extends Type<any> {}