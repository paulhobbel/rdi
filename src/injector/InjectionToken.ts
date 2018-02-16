export class InjectionToken<T> {
    readonly metadataName = 'InjectionToken';
    readonly type: T;

    constructor(protected desc: string) { }

    toString(): string {
        return `InjectionToken ${this.desc}`;
    }
}
