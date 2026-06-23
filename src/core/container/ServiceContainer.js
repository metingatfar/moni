export class ServiceContainer {
    static instance;
    services = new Map();
    factories = new Map();
    constructor() { }
    static getInstance() {
        if (!ServiceContainer.instance) {
            ServiceContainer.instance = new ServiceContainer();
        }
        return ServiceContainer.instance;
    }
    register(token, instance) {
        this.services.set(token, instance);
        console.log(`[ServiceContainer] Registered service singleton: ${token}`);
    }
    registerFactory(token, factory) {
        this.factories.set(token, factory);
        console.log(`[ServiceContainer] Registered service factory: ${token}`);
    }
    resolve(token) {
        if (this.services.has(token)) {
            return this.services.get(token);
        }
        if (this.factories.has(token)) {
            const factory = this.factories.get(token);
            const instance = factory();
            this.services.set(token, instance); // Cache it
            return instance;
        }
        throw new Error(`[ServiceContainer] Service token not registered: ${token}`);
    }
    clear() {
        this.services.clear();
        this.factories.clear();
    }
}
export const container = ServiceContainer.getInstance();
