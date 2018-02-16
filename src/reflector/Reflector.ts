import { PARAMETERS, ANNOTATIONS, PROP_METADATA, getParentCtor } from '../util';
import { Type, isType } from '../Type';

/**
 * Provides access to reflection data about symbols. Used internally by DiscordBuddy
 * to power dependency injection and compilation.
 */
export class Reflector {
    private _reflect: any;

    constructor(reflect?: any) {
        this._reflect = reflect || Reflect;
    }

    isReflectionEnabled(): boolean {
        return true;
    }
    factory<T>(type: Type<T>): (args: any[]) => T {
        return (...args: any[]) => new type(...args);
    }

    // THIS SHOULDN'T BE NEEDED ANYMORE!
    private _zipTypesAndAnnotations(paramTypes: any[], paramAnnotations: any[]): any[][] {
        let result: any[][];

        if (typeof paramTypes === 'undefined') {
            result = new Array(paramAnnotations.length);
        } else {
            result = new Array(paramTypes.length);
        }

        for (let i = 0; i < result.length; i++) {
            // TS outputs Object for parameters without types, while Traceur omits
            // the annotations. For now we preserve the Traceur behavior to aid
            // migration, but this can be revisited.
            if (typeof paramTypes === 'undefined') {
                result[i] = [];
            } else if (paramTypes[i] != Object) {
                result[i] = [paramTypes[i]];
            } else {
                result[i] = [];
            }
            if (paramAnnotations && paramAnnotations[i] != null) {
                result[i] = result[i].concat(paramAnnotations[i]);
            }
        }
        return result;
    }

    private ownParameters(type: Type<any>, parentCtor: any): any[][] {
        // Prefer the direct API.
        if ((<any>type).parameters && (<any>type).parameters !== parentCtor.parameters) {
            return (<any>type).parameters;
        }

        // API for metadata created by invoking the decorators.
        if(this._reflect && this._reflect.getOwnMetadata) {
            const paramAnnotations = this._reflect.getOwnMetadata(PARAMETERS, type);
            const paramTypes = this._reflect.getOwnMetadata('design:paramtypes', type);
            if (paramTypes || paramAnnotations) {
                return this._zipTypesAndAnnotations(paramTypes, paramAnnotations);
            }
        }

        // If a class has no decorators, at least create metadata
        // based on function.length.
        // Note: We know that this is a real constructor as we checked
        // the content of the constructor above.
        return new Array((<any>type.length)).fill(undefined);
    }

    parameters(type: Type<any>): any[][] {
        if (!isType(type)) {
            return [];
        }

        const parentCtor = getParentCtor(type);
        const ownParameters = this.ownParameters(type, parentCtor);
        const parentParameters = parentCtor !== Object ? this.parameters(parentCtor) : [];

        return parentParameters.concat(ownParameters) || [];
    }

    private ownAnnotations(typeOrFunc: Type<any>, parentCtor: any): any[] | null {
        // Prefer the direct API.
        if ((<any>typeOrFunc).annotations && (<any>typeOrFunc).annotations !== parentCtor.annotations) {
            let annotations = (<any>typeOrFunc).annotations;
            if (typeof annotations === 'function' && annotations.annotations) {
                annotations = annotations.annotations;
            }
            return annotations;
        }

        // API for metadata created by invoking the decorators.
        if (this._reflect && this._reflect.getOwnMetadata) {
            return this._reflect.getOwnMetadata(ANNOTATIONS, typeOrFunc);
        }

        return null;
    }

    /**
     * Return annotations of given prototype
     * 
     * @param type - The prototype to parse
     */
    annotations(type: Type<any>): any[] {
        if (!isType(type)) {
            return [];
        }

        const parentCtor = getParentCtor(type);
        const ownAnnotations = this.ownAnnotations(type, parentCtor);
        const parentAnnotations = parentCtor !== Object ? this.annotations(parentCtor) : [];

        return parentAnnotations.concat(ownAnnotations);
    }

    private ownPropMetadata(typeOrFunc: Type<any>, parentCtor: any): {[key: string]: any[]}|null {
        // Prefer the direct API.
        if ((<any>typeOrFunc).propMetadata &&
            (<any>typeOrFunc).propMetadata !== parentCtor.propMetadata) {
            let propMetadata = (<any>typeOrFunc).propMetadata;
            if (typeof propMetadata === 'function' && propMetadata.propMetadata) {
                propMetadata = propMetadata.propMetadata;
            }
            return propMetadata;
        }

        // API for metadata created by invoking the decorators.
        if(this._reflect && this._reflect.getOwnMetadata) {
            return this._reflect.getOwnMetadata(PROP_METADATA, typeOrFunc);
        }

        return null;
    }

    propMetadata(type: Type<any>): { [key: string]: any[] } {
        if (!isType(type)) {
            return {};
        }

        const parentCtor = getParentCtor(type);
        const propMetadata: { [key: string]: any[] } = {};
        if(parentCtor !== Object) {
            const parentPropMetadata = this.propMetadata(parentCtor);
            Object.keys(parentPropMetadata).forEach((propName) => {
                propMetadata[propName] = parentPropMetadata[propName];
            });
        }
        const ownPropMetadata = this.ownPropMetadata(type, parentCtor);
        if(ownPropMetadata) {
            Object.keys(ownPropMetadata).forEach((propName) => {
                const decorators: any[] = [];
                if(propMetadata.hasOwnProperty(propName)) {
                    decorators.push(...propMetadata[propName]);
                }
                decorators.push(...ownPropMetadata[propName]);
                propMetadata[propName] = decorators;
            });
        }

        return propMetadata;
    }

    resolveEnum(enumIdentifier: any, name: string) {
        return enumIdentifier[name];
    }
}
