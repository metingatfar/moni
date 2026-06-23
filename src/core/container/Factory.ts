import { container } from './ServiceContainer';

export class Factory {
  public static create<T>(token: string): T {
    return container.resolve<T>(token);
  }
}
