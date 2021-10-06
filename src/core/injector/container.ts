import { DependencyContainer } from "tsyringe";

export class GlobalContainer {
    private readonly globalModules = new Set<Module>;
}
