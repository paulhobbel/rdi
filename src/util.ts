import "reflect-metadata";

import { Type } from './Type';
import { TypeDecorator } from './TypeDecorator';

export const ANNOTATIONS = '__annotations__';
export const PARAMETERS = '__paramaters__';
export const PROP_METADATA = '__prop__metadata__';

export function getParentCtor(ctor: Function): Type<any> {
    const parentProto = Object.getPrototypeOf(ctor.prototype);
    const parentCtor = parentProto ? parentProto.constructor : null;
    // Note: We always use `Object` as the null value
    // to simplify checking later on.
    return parentCtor || Object;
}

export function makeDecorator(
    name: string, props?: (...args: any[]) => any, parentClass?: any,
    chainFn?: (fn: Function) => void): (...args: any[]) => (cls: any) => any {
    const metaCtor = makeMetadataCtor(props);

    function DecoratorFactory(this: any, objOrType: any): (cls: any) => any {
        if (!(Reflect && Reflect.getOwnMetadata)) {
            throw 'reflect-metadata shim is required when using class decorators';
        }

        if (this instanceof DecoratorFactory) {
            metaCtor.call(this, objOrType);
            return this;
        }

        const annotationInstance = new (<any>DecoratorFactory)(objOrType);
        const TypeDecorator: TypeDecorator = <TypeDecorator>function TypeDecorator(cls: Type<any>) {
            const annotations = Reflect.getOwnMetadata(ANNOTATIONS, cls) || [];
            annotations.push(annotationInstance);

            Reflect.defineMetadata(ANNOTATIONS, annotations, cls);
            return cls;
        };

        if (chainFn) chainFn(TypeDecorator);
        return TypeDecorator;
    }

    if (parentClass) {
        DecoratorFactory.prototype = Object.create(parentClass.prototype);
    }

    DecoratorFactory.prototype.metadataName = name;
    DecoratorFactory.prototype.isTypeOf = (obj: any) => obj && obj.metadataName === name;
    
    (<any>DecoratorFactory).annotationCls = DecoratorFactory;
    return DecoratorFactory;
}

export function makeParamDecorator(
    name: string, props?: (...args: any[]) => any, parentClass?: any): any {
    const metaCtor = makeMetadataCtor(props);
    function ParamDecoratorFactory(this: any, ...args: any[]): any {
        if (this instanceof ParamDecoratorFactory) {
            metaCtor.apply(this, args);
            return this;
        }
        const annotationInstance = new (<any>ParamDecoratorFactory)(...args);

        (<any>ParamDecorator).annotation = annotationInstance;
        return ParamDecorator;

        function ParamDecorator(cls: any, _unusedKey: any, index: number): any {
            const parameters: (any[] | null)[] = Reflect.getOwnMetadata(PARAMETERS, cls) || [];

            // there might be gaps if some in between parameters do not have annotations.
            // we pad with nulls.
            while (parameters.length <= index) {
                parameters.push(null);
            }

            parameters[index] = parameters[index] || [];
            parameters[index]!.push(annotationInstance);

            Reflect.defineMetadata(PARAMETERS, parameters, cls);
            return cls;
        }
    }
    if (parentClass) {
        ParamDecoratorFactory.prototype = Object.create(parentClass.prototype);
    }

    ParamDecoratorFactory.prototype.metadataName = name;
    (<any>ParamDecoratorFactory).annotationCls = ParamDecoratorFactory;
    return ParamDecoratorFactory;
}

export function makePropDecorator(
    name: string, props?: (...args: any[]) => any, parentClass?: any): any {
    const metaCtor = makeMetadataCtor(props);

    function PropDecoratorFactory(this: any, ...args: any[]): any {
        if (this instanceof PropDecoratorFactory) {
            metaCtor.apply(this, args);
            return this;
        }

        const decoratorInstance = new (<any>PropDecoratorFactory)(...args);

        return function PropDecorator(target: any, name: string) {
            const meta = Reflect.getOwnMetadata(PROP_METADATA, target.constructor) || {};
            meta[name] = meta.hasOwnProperty(name) && meta[name] || [];
            meta[name].unshift(decoratorInstance);
            Reflect.defineMetadata(PROP_METADATA, meta, target.constructor);
        };
    }

    if (parentClass) {
        PropDecoratorFactory.prototype = Object.create(parentClass.prototype);
    }

    PropDecoratorFactory.prototype.metadataName = name;
    (<any>PropDecoratorFactory).annotationCls = PropDecoratorFactory;
    return PropDecoratorFactory;
}


function makeMetadataCtor(props?: (...args: any[]) => any): any {
    return function ctor(this: any, ...args: any[]) {
        if (props) {
            const values = props(...args);
            for (const propName in values) {
                this[propName] = values[propName];
            }
        }
    };
}

export function stringify(token: any): string {
    if (typeof token === 'string') {
        return token;
    }

    if (token instanceof Array) {
        return '[' + token.map(stringify).join(', ') + ']';
    }

    if (token == null) {
        return '' + token;
    }

    if (token.overriddenName) {
        return `${token.overriddenName}`;
    }

    if (token.name) {
        return `${token.name}`;
    }

    const res = token.toString();

    if (res == null) {
        return '' + res;
    }

    const newLineIndex = res.indexOf('\n');
    return newLineIndex === -1 ? res : res.substring(0, newLineIndex);
}