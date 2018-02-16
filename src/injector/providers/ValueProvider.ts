import { BaseProvider } from './BaseProvider';

/**
 * Configures the {@link Injector} to return a value for a token.
 * @example
 * ```
 * const provider: ValueProvider = {provide: 'someToken', useValue: 'someValue'};
 * ```
 */
export interface ValueProvider extends BaseProvider<any> {
    /**
     * The value to inject.
     */
    useValue: any;
}