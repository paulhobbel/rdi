import { ResolvedReflectiveProvider } from "../injector";
import { stringify } from "../util";

export class NoMixMultiProviderError extends Error {
    constructor(existing: ResolvedReflectiveProvider, provider: ResolvedReflectiveProvider) {
        super(`Cannot mix multi providers and regular providers, got: ${stringify(existing)} and ${stringify(provider)}`);
    }
}