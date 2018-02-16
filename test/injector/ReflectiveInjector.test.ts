import "jest"

import { ReflectiveInjector, Injectable, Inject, Optional } from '../../src';

class Engine { }

class OtherEngine extends Engine { }

@Injectable()
class Car {
    constructor(public engine: Engine) { }
}

@Injectable()
class SportsCar extends Car { }

@Injectable()
class CarWithOtherEngine {
    constructor( @Inject(OtherEngine) public engine: Engine) { }
}

@Injectable()
class CarWithOptionalEngine {
    constructor( @Optional() public engine: Engine) { }
}

describe("ReflectiveInjector", () => {
    it('should instatiate a class without depenencies', () => {
        const injector = ReflectiveInjector.resolveAndCreate([Engine]);
        const engine = injector.get(Engine);

        expect(engine).toBeInstanceOf(Engine);
    });

    it('should resolve dependencies based on type information', () => {
        const injector = ReflectiveInjector.resolveAndCreate([Engine, Car]);
        const car = injector.get(Car);

        expect(car).toBeInstanceOf(Car);
        expect(car.engine).toBeInstanceOf(Engine);
    });

    it('should resolve dependencies based on @Inject decorator', () => {
        const injector = ReflectiveInjector.resolveAndCreate([OtherEngine, Engine, CarWithOtherEngine]);
        const car = injector.get(CarWithOtherEngine);

        expect(car).toBeInstanceOf(CarWithOtherEngine);
        expect(car.engine).toBeInstanceOf(OtherEngine);
    });

    it('should resolve a provider to a value', () => {
        const injector = ReflectiveInjector.resolveAndCreate([{ provide: Engine, useValue: 'fake engine' }]);

        const engine = injector.get(Engine);
        expect(engine).toEqual('fake engine');
    });

    it('should cache instances in map', () => {
        const injector = ReflectiveInjector.resolveAndCreate([Engine]);

        expect(injector.get(Engine)).toBe(injector.get(Engine));
    });

    it('should support optional dependencies', () => {
        const injector = ReflectiveInjector.resolveAndCreate([CarWithOptionalEngine]);

        const car = injector.get(CarWithOptionalEngine);
        expect(car.engine).toBeNull();
    });

    it('should support multi providers', () => {
        const injector = ReflectiveInjector.resolveAndCreate([
            Engine,
            { provide: Car, useClass: SportsCar, multi: true },
            { provide: Car, useClass: CarWithOptionalEngine, multi: true }
        ]);

        const cars: any = injector.get(Car);

        expect((cars as any[]).length).toEqual(2);
        expect(cars[0]).toBeInstanceOf(SportsCar);
        expect(cars[1]).toBeInstanceOf(CarWithOptionalEngine);
    });
});