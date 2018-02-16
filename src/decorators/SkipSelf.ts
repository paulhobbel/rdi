import { makeParamDecorator } from '../util';

/**
 * Type of the SkipSelf decorator / constructor function.
 */
export interface SkipSelfDecorator {
    /**
     * Specifies that the dependency resolution should start from the parent injector.
     * @example
     * ```
     * @Injectable()
     * class Car {
     *   constructor(@SkipSelf() public engine:Engine) {}
     * }
     * ```
     */
    (): any;
    new (): SkipSelf;
  }
  
  /**
   * Type of the SkipSelf metadata.
   */
  export interface SkipSelf {}
  
  /**
   * SkipSelf decorator and metadata.
   */
  export const SkipSelf: SkipSelfDecorator = makeParamDecorator('SkipSelf');