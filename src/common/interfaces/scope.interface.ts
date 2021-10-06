import { Lifecycle } from "tsyringe";
export enum Scope {
  /**
   * Each resolve will return the same instance (including resolves from child containers)
   */
  Singleton = Lifecycle.Singleton,
  /**
   * The default registration scope, a new instance will be created with each resolve
   */
  Transient = Lifecycle.Transient,
  /**
   * The same instance will be resolved for each resolution of this dependency during a single resolution chain
   */
  ResolutionScoped = Lifecycle.ResolutionScoped,
  /**
   * The dependency container will return the same instance each time a resolution for this dependency is requested. This is similar to being a singleton, however if a child container is made, that child container will resolve an instance unique to it.
   */
  ContainerScoped = Lifecycle.ContainerScoped,
}
