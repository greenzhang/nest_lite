import { container, DependencyContainer } from "tsyringe";

export class Kernel {
  public create(module?: any) {
    const childContainer = container.createChildContainer();
  }
  async initialize(module: any, container: DependencyContainer, config?: any) {
    return module;
  }
}
