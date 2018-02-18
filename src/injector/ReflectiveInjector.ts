import { Injector } from './Injector';
import { InjectionToken } from './InjectionToken';
import { Type } from '../Type';
import { Provider } from './providers';
import { ResolvedReflectiveProvider, ResolvedReflectiveFactory, ReflectiveDependency } from './reflective';
import { ReflectiveKey } from './ReflectiveKey';
import { KeyRegistry } from './KeyRegistry';
import { Self, SkipSelf } from '../decorators';
import { NoProviderError } from '../errors';

const NOT_RESOLVED = new Object();
const INJECTOR_KEY = KeyRegistry.get(Injector);

/**
 * A reflective injector, can also be seen as smart injector
 * It uses Reflect to determine what providers to inject
 */
export class ReflectiveInjector implements Injector {

    private resolveMap: Map<number, any> = new Map();

    /**
     * Private ReflectiveInjector Constructor.
     * Use {@link #fromResolvedProviders} or {@link #resolveAndCreate}
     * to create a new ReflectiveInjector.
     * @param providers - Resolved providers
     * @param parent - Parent injector
     */
    private constructor(
        private providers: ResolvedReflectiveProvider[],
        private parent: Injector = null
    ) { }

    /**
     * Retrieves an instance from the injector based on the provided token.
     * @param token - Token which refers to provider
     * @param notFoundValue - Fallback value
     * @throws Throws an error if `notFoundValue` is not set
     */
    get<T>(token: Type<T> | InjectionToken<T> | Object, notFoundValue?: T): T {
        return this.getByKey(KeyRegistry.get(token), null, notFoundValue);
    }

    /**
     * Retrieves an instance from the injector based on the provided token.
     * @param token - Token which refers to provider
     * @param notFoundValue - Fallback value
     * @throws Throws an error if `notFoundValue` is not set
     */
    getAsync<T>(token: Type<T> | InjectionToken<T> | Object, notFoundValue?: T): Promise<Type<T>> {
        return Promise.resolve(this.getByKey(KeyRegistry.get(token), null, notFoundValue));
    }

    private instantiateProvider(provider: ResolvedReflectiveProvider): any {
        if (provider.multiProvider) {
            const res = [];
            for (const resolvedFactory of provider.resolvedFactories) {
                res.push(this.instantiate(resolvedFactory));
            }
            return res;
        }

        return this.instantiate(provider.resolvedFactory);
    }


    private instantiate(resolvedFactory: ResolvedReflectiveFactory): any {
        const factory = resolvedFactory.factory;

        try {
            const deps = resolvedFactory.dependencies.map(dep => this.getByReflectiveDependency(dep));
            return factory(...deps);;
        } catch (err) {
            throw err;
        }
    }

    private getByReflectiveDependency(dep: ReflectiveDependency): any {
        return this.getByKey(dep.key, dep.visibility, dep.optional ? null : Injector.THROW_IF_NOT_FOUND);
    }

    private getByKey(key: ReflectiveKey, visibility: Self | SkipSelf | null, notFoundValue: any): any {
        if (key === INJECTOR_KEY) {
            return this;
        }

        if (visibility instanceof Self) {
            return this.getBySelf(key, notFoundValue);
        }

        return this.getByDefault(key, notFoundValue, visibility);
    }

    private getBySelf(key: ReflectiveKey, notFoundValue: any): any {
        const obj = this.getObjectByKeyId(key.id);

        return obj !== NOT_RESOLVED ? obj : this.throwOrNull(key, notFoundValue);
    }

    private getByDefault(key: ReflectiveKey, notFoundValue: any, visibility: Self | SkipSelf | null): any {
        let inj = visibility instanceof SkipSelf ? this.parent : this;

        // Bruteforce? Yep sorry :(
        while (inj instanceof ReflectiveInjector) {
            const obj = inj.getObjectByKeyId(key.id);
            if (obj !== NOT_RESOLVED) return obj;
            inj = inj.parent;
        }

        if (inj !== null) {
            return inj.get(key.token as Type<any>, notFoundValue);
        }

        return this.throwOrNull(key, notFoundValue);
    }

    private getObjectByKeyId(id: number): any {
        if (this.resolveMap.has(id)) {
            return this.resolveMap.get(id);

        }

        const resolvedProvider = this.providers.find(provider => provider.key.id === id);
        if (!resolvedProvider) {
            return NOT_RESOLVED;
        }

        const obj = this.instantiateProvider(resolvedProvider);
        this.resolveMap.set(id, obj);

        return obj;
    }

    private throwOrNull(key: ReflectiveKey, notFoundValue: any): any {
        if (notFoundValue !== Injector.THROW_IF_NOT_FOUND) {
            return notFoundValue;
        }

        throw new NoProviderError(key);
    }

    /**
     * Resolve given providers
     * @param providers - Providers to resolve
     */
    static resolve(providers: Provider[]): ResolvedReflectiveProvider[] {
        return ResolvedReflectiveProvider.fromProviders(providers);
    }

    /**
     * Creates a ReflectiveInjector based on given ResolvedReflectiveProvider's
     * @param providers - Resolved providers
     * @param parent - Parent Injector
     */''
    static fromResolvedProviders(providers: ResolvedReflectiveProvider[], parent?: Injector): ReflectiveInjector {
        return new ReflectiveInjector(providers, parent);
    }

    /**
     * Combines {@link ReflectiveInjector#resolve} and {@link ReflectiveInjector#fromResolvedProviders}
     * to create a Injector from given unresolved providers
     * @param providers - Providers to resolve
     * @param parent - Parent Injector
     */
    static resolveAndCreate(providers: Provider[], parent?: Injector): ReflectiveInjector {
        const resolvedProviders = ReflectiveInjector.resolve(providers);
        return ReflectiveInjector.fromResolvedProviders(resolvedProviders, parent);
    }
}