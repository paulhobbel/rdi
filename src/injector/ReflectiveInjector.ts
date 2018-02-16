import { Injector } from './Injector';
import { InjectionToken } from './InjectionToken';
import { Type } from '../Type';
import { Provider } from './providers';
import { ResolvedReflectiveProvider, ResolvedReflectiveFactory, ReflectiveDependency } from './reflective';
import { KeyRegistry, ReflectiveKey } from './ReflectiveKey';
import { Self, SkipSelf } from '../decorators';

const NOT_RESOLVED = new Object();

/**
 * A reflective injector, can also be seen as smart injector
 * It uses Reflect to determine what providers to inject
 */
export class ReflectiveInjector implements Injector {

    private resolveMap: Map<number, any> = new Map();

    constructor(
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

    /**
     * Resolves a provider and instantiates an object in the context of the injector.
     *
     * The created object does not get cached by the injector.
     *
     * ### Example ([live demo](http://plnkr.co/edit/yvVXoB?p=preview))
     *
     * ```typescript
     * @Injectable()
     * class Engine {
     * }
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine:Engine) {}
     * }
     *
     * var injector = ReflectiveInjector.resolveAndCreate([Engine]);
     *
     * var car = injector.resolveAndInstantiate(Car);
     * expect(car.engine).toBe(injector.get(Engine));
     * expect(car).not.toBe(injector.resolveAndInstantiate(Car));
     * ```
     */
    resolveAndInstantiate(provider: Provider): any {
        return this.instantiateProvider(ReflectiveInjector.resolve([provider])[0]);
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

        let deps: any[];
        try {
            deps = resolvedFactory.dependencies.map(dep => this.getByReflectiveDependency(dep));
        } catch (err) {
            throw err;
        }

        let obj: any;
        try {
            obj = factory(...deps);
        } catch (err) {
            // Better error...
            throw err;
        }

        return obj;
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

        //throw noProviderError(this, key);
        throw new Error('No provider for key: ' + key.displayName);
    }

    static resolve(providers: Provider[]): ResolvedReflectiveProvider[] {
        return ResolvedReflectiveProvider.fromProviders(providers);
    }

    static resolveAndCreate(providers: Provider[], parent?: Injector): ReflectiveInjector {
        const resolvedProviders = this.resolve(providers);
        return ReflectiveInjector.fromResolvedProviders(resolvedProviders, parent);
    }

    static fromResolvedProviders(providers: ResolvedReflectiveProvider[], parent?: Injector): ReflectiveInjector {
        return new ReflectiveInjector(providers, parent);
    }
}

const INJECTOR_KEY = KeyRegistry.get(Injector);