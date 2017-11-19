export class DataSource {
    constructor() {
        if (new.target === DataSource) {
            throw new TypeError("Cannot construct DataSource instances directly");
        }
    }

    getValue() {
        throw new TypeError("Must override getValue function in child class.");
    }
}