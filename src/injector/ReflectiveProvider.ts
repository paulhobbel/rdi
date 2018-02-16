import { stringify } from '../util';
import { Type } from '../Type';

export function noAnnotationError(typeOrFunc: Type<any> | Function, params: any[][]): Error {
    const signature: string[] = [];
    for (let i = 0, ii = params.length; i < ii; i++) {
        const parameter = params[i];
        if (!parameter || parameter.length == 0) {
            signature.push('?');
        } else {
            signature.push(parameter.map(stringify).join(' '));
        }
    }
    return Error(
        'Cannot resolve all parameters for \'' + stringify(typeOrFunc) + '\'(' +
        signature.join(', ') + '). ' +
        'Make sure that all the parameters are decorated with Inject or have valid type annotations and that \'' +
        stringify(typeOrFunc) + '\' is decorated with Injectable.');
}
