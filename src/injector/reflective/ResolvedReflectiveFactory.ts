import { ReflectiveDependency } from './ReflectiveDependency';
import { noAnnotationError } from '../ReflectiveProvider';
import { KeyRegistry } from '../ReflectiveKey';
import { Type } from '../../Type';
import { NormalizedProvider } from '../providers';

import { Inject, Optional, Self, SkipSelf } from '../../decorators';
import { InjectionToken } from '../InjectionToken';

import { reflector } from '../../reflector';

export class ResolvedReflectiveFactory {
    constructor(
        /**
         * Factory function which can return an instance of an object represented by a key.
         */
        public factory: Function,

        /**
         * Arguments (dependencies) to the factory function.
         */
        public dependencies: ReflectiveDependency[]
    ) { }

    static fromProvider(provider: NormalizedProvider): ResolvedReflectiveFactory {
        let factoryFn: Function;
        let resolvedDeps: ReflectiveDependency[];

        if (provider.useClass) {
            factoryFn = reflector.factory(provider.useClass);
            resolvedDeps = this.dependenciesFor(provider.useClass);
        } else if (provider.useExisting) {
            factoryFn = (alias: any) => alias;
            resolvedDeps = [ReflectiveDependency.fromKey(KeyRegistry.get(provider.useExisting))];
        } else if (provider.useFactory) {
            factoryFn = provider.useFactory;
            resolvedDeps = this.constructDependencies(provider.useFactory, provider.deps);
        } else {
            factoryFn = () => provider.useValue;
            resolvedDeps = [];
        }

        return new ResolvedReflectiveFactory(factoryFn, resolvedDeps);
    }

    private static constructDependencies(type: any, dependencies?: any[]): ReflectiveDependency[] {
        if(!dependencies) {
            return this.dependenciesFor(type);
        }
    
        const params: any[][] = dependencies.map(token => [token]);
        return dependencies.map(token => this.extractToken(type, token, params));
    }

    private static dependenciesFor(type: Type<any>): ReflectiveDependency[] {
        const params = reflector.parameters(type);

        if (!params) { return []; }
        if (params.some(param => param == null)) {
            throw noAnnotationError(type, params);
        }

        return params.map(param => this.extractToken(type, param, params));
    }

    private static extractToken(type: Type<any>, metadata: any | any[], params: any[][]): ReflectiveDependency {
        let token = null;
        let optional = false;

        if (!Array.isArray(metadata)) {
            if (metadata instanceof Inject) {
                return ReflectiveDependency.fromToken(metadata.token, optional, null);
            } else {
                return ReflectiveDependency.fromToken(metadata, optional, null);
            }
        }

        let visibility: Self | SkipSelf | null = null;

        for (const paramMeta of metadata) {
            if (paramMeta instanceof Type || paramMeta instanceof InjectionToken) {
                token = paramMeta;
            }
            else if (paramMeta instanceof Inject) {
                token = paramMeta.token;
            }
            else if (paramMeta instanceof Optional) {
                optional = true;
            }
            else if(paramMeta instanceof Self || paramMeta instanceof SkipSelf) {
                visibility = paramMeta;
            }
        }

        if (!token) {
            throw noAnnotationError(type, params);
        }

        return ReflectiveDependency.fromToken(token, optional, visibility);
    }
}