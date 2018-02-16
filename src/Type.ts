export const Type = Function;

export interface Type<T> extends Function { new (...args: any[]): T; }

export function isType(obj: any): obj is Type<any> {
    return typeof obj === 'function';
}