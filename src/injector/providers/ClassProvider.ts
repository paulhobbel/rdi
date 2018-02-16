import { BaseProvider, Type } from './BaseProvider';

/**
 * Configures the {@link Injector} to return an instance of `useClass` for a token.
 * @example
 * ```
 * @Injectable()
 * class MyService {}
 *
 * const provider: ClassProvider = {provide: 'someToken', useClass: MyService};
 * ```
 */
export interface ClassProvider extends BaseProvider<any> {
    /**
     * Class to instantiate for the `token`.
     */
    useClass: Type<any>;
}
