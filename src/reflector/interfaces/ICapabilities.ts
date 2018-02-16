import { Type } from '../../Type';

export interface ICapabilities {
    isReflectionEnabled(): boolean;
    factory(type: Type<any>): Function;
  
    /**
     * Return a list of annotations/types for constructor parameters
     */
    parameters(type: Type<any>): any[][];
  
    /**
     * Return a list of annotations declared on the class
     */
    annotations(type: Type<any>): any[];
  
    /**
     * Return a object literal which describes the annotations on Class fields/properties.
     */
    propMetadata(typeOrFunc: Type<any>): {[key: string]: any[]};

    resolveEnum(enumIdentifier: any, name: string): any;
  }