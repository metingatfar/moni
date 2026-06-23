export class ServiceContainer {
  private static instance: ServiceContainer;
  private services: Map<string, any> = new Map();
  private factories: Map<string, () => any> = new Map();

  private constructor() {}

  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  public register(token: string, instance: any): void {
    this.services.set(token, instance);
    console.log(`[ServiceContainer] Registered service singleton: ${token}`);
  }

  public registerFactory(token: string, factory: () => any): void {
    this.factories.set(token, factory);
    console.log(`[ServiceContainer] Registered service factory: ${token}`);
  }

  public resolve<T>(token: string): T {
    if (this.services.has(token)) {
      return this.services.get(token) as T;
    }

    if (this.factories.has(token)) {
      const factory = this.factories.get(token)!;
      const instance = factory();
      this.services.set(token, instance); // Cache it
      return instance as T;
    }

    throw new Error(`[ServiceContainer] Service token not registered: ${token}`);
  }

  public clear(): void {
    this.services.clear();
    this.factories.clear();
  }
}

export const container = ServiceContainer.getInstance();
