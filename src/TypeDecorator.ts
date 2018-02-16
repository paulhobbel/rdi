import { Type } from './Type';

/**
 * An interface implemented by all DiscordBuddy type decorators, which allows them to be used as ES7
 * decorators.
 *
 * ES7 syntax:
 *
 * ```
 * @Command({...})
 * class MyCommand {...}
 * ```
 */
export interface TypeDecorator {
    /**
     * Invoke as ES7 decorator.
     */
    <T extends Type<any>>(type: T): T;

    (target: Object, propertyKey?: string | symbol, parameterIndex?: number): void;
}