import { ReflectiveKey } from "../injector/ReflectiveKey";

export class NoProviderError extends Error {
    constructor(key: ReflectiveKey) {
        super(`No provider for key: ${key.displayName}`);
    }
}