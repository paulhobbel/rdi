export class NoTokenError extends Error {
    constructor() {
        super('Token must be defined!');
    }
}