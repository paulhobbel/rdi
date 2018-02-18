import { Provider } from "../injector/providers";
import { stringify } from '../util';

export class InvalidProviderError extends Error {
    constructor(provider: Provider) {
        super(`Invalid provider - only instances of Provider and Type are allowed, got: ${stringify(provider)}`)
    }
}