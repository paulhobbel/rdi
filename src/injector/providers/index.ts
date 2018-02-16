import { TypeProvider } from './TypeProvider';
import { ValueProvider } from './ValueProvider';
import { ClassProvider } from './ClassProvider';
import { ExistingProvider } from './ExistingProvider';
import { FactoryProvider } from './FactoryProvider';

/**
 * Describes how the {@link Injector} should be configured.
 */
export type Provider =
    TypeProvider | ValueProvider | ClassProvider | ExistingProvider | FactoryProvider | any[];


export { NormalizedProvider } from './NormalizedProvider';
export { TypeProvider, ValueProvider, ClassProvider, ExistingProvider, FactoryProvider }