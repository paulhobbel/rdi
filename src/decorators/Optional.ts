import { makeParamDecorator } from '../util';

/**
 * Type of the Optional decorator / constructor function.
 */
export interface OptionalDecorator {
    /**
     * A parameter metadata that marks a dependency as optional.
     * {@link Injector} provides `null` if the dependency is not found.
     * @example
     * ```
     * @Injectable()
     * class Car {
     *   constructor(@Optional() public engine:Engine) {}
     * }
     * ```
     */
    (): any;
    new (): Optional;
  }
  
  /**
   * Type of the Optional metadata.
   */
  export interface Optional {}
  
  /**
   * Optional decorator and metadata.
   */
  export const Optional: OptionalDecorator = makeParamDecorator('Optional');