import { ReflectiveKey, KeyRegistry } from '../ReflectiveKey';
import { ResolvedReflectiveFactory } from './ResolvedReflectiveFactory';
import { Provider, NormalizedProvider } from '../providers';
import { Type } from '../../Type';
import { stringify } from '../../util';

export class ResolvedReflectiveProvider {
    constructor(
        /**
         * A key, usually a `Type<any>`.
         */
        public key: ReflectiveKey,

        /**
         * Factory function which can return an instance of an object represented by a key.
         */
        public resolvedFactories: ResolvedReflectiveFactory[],

        /**
         * Indicates if the provider is a multi-provider or a regular provider.
         */
        public multiProvider: boolean
    ) { }

    /**
     * Get the first resolved factory
     */
    get resolvedFactory(): ResolvedReflectiveFactory {
        return this.resolvedFactories[0];
    }

    /**
     * Resolve a {@link Provider} into a {@link ResolvedProvider}
     * @param provider 
     */
    static fromProvider(provider: NormalizedProvider): ResolvedReflectiveProvider {
        return new ResolvedReflectiveProvider(
            KeyRegistry.get(provider.provide), [ResolvedReflectiveFactory.fromProvider(provider)], provider.multi || false);
    }

    /**
     * Resolve a list of {@link Provider[]} into {@link ResolvedReflectiveProvider[]}
     * @param providers - List of raw providers
     */
    static fromProviders(providers: Provider[]): ResolvedReflectiveProvider[] {
        const normalized = this.normalizeProviders(providers, []);
        const resolved = normalized.map(this.fromProvider);
        const resolvedProviderMap = this.merge(resolved, new Map());
        return Array.from(resolvedProviderMap.values());
    }

    /**
     * Normalize a list of {@link Provider[]}
     * @todo Move to util class
     * @param providers - List of raw providers
     * @param res - List of normalized providers
     */
    private static normalizeProviders(providers: Provider[], res: Provider[]): NormalizedProvider[] {
        for (const provider of providers) {
            if (provider instanceof Type) {
                res.push({ provide: provider, useClass: provider })
            }
            else if (provider && typeof provider === 'object' && (provider as any).provide !== undefined) {
                res.push(provider as NormalizedProvider);
            }
            else if (provider instanceof Array) {
                this.normalizeProviders(provider, res);
            } else {
                throw new Error(`Invalid provider - only instances of Provider and Type are allowed, got: ${stringify(provider)}`);
            }
        }

        return res as NormalizedProvider[];
    }

    /**
     * Dedupes list of providers
     * @param providers - Resolved providers to be merged
     * @param map - Map holding merged providers
     */
    private static merge(providers: ResolvedReflectiveProvider[], map: Map<number, ResolvedReflectiveProvider>): Map<number, ResolvedReflectiveProvider> {
        for (const provider of providers) {
            // Check if this provider exists already in our map
            const existing = map.get(provider.key.id);
            if (existing) {
                if (provider.multiProvider !== existing.multiProvider) {
                    throw new Error(`Cannot mix multi providers and regular providers, got: ${existing} ${provider}`);
                }

                if (provider.multiProvider) {
                    // TODO: Change this to .concat
                    for (const factory of provider.resolvedFactories) {
                        existing.resolvedFactories.push(factory);
                    }
                } else {
                    map.set(provider.key.id, provider);
                }
            } else {
                let resolvedProvider: ResolvedReflectiveProvider;
                if (provider.multiProvider) {
                    resolvedProvider = new ResolvedReflectiveProvider(
                        provider.key, provider.resolvedFactories.slice(), provider.multiProvider);
                } else {
                    resolvedProvider = provider;
                }
                map.set(provider.key.id, resolvedProvider);
            }
        }

        return map;
    }
}