import { TypeProvider } from './TypeProvider';
import { ValueProvider } from './ValueProvider';
import { ClassProvider } from './ClassProvider';
import { ExistingProvider } from './ExistingProvider';
import { FactoryProvider } from './FactoryProvider';

/**
 * Describes how the {@link Injector} should be configured.
 */
export interface NormalizedProvider extends TypeProvider, ValueProvider, ClassProvider, ExistingProvider,
    FactoryProvider { }