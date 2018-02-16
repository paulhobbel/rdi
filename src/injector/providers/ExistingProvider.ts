import { BaseProvider } from './BaseProvider';

/**
 * Configures the {@link Injector} to return a value of another `useExisting` token.
 * @example
 * ```
 * const provider: ExistingProvider = {provide: 'someToken', useExisting: 'someOtherToken'};
 * ```
 */
export interface ExistingProvider extends BaseProvider<any> {
    /**
     * Existing `token` to return. (equivalent to `injector.get(useExisting)`)
     */
    useExisting: any;
}