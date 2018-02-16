import { makeDecorator } from '../util';

/**
 * Type of the Injectable decorator / constructor function.
 */
export interface InjectableDecorator {
    /**
     * A marker metadata that marks a class as available to {@link Injector} for creation.
     * @example
     * ```
     * @Injectable()
     * class Car {}
     * ```
     *
     * {@link Injector} will throw an error when trying to instantiate a class that
     * does not have `@Injectable` marker, as shown in the example above.
     */
    (): ClassDecorator;
    new (): Injectable;
  }
  
  /**
   * Type of the Injectable metadata.
   */
  export interface Injectable {}
  
  /**
   * Injectable decorator and metadata.
   */
  export const Injectable: InjectableDecorator = <InjectableDecorator>makeDecorator('Injectable');