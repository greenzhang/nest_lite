import { Type } from "../../common/interfaces/type.interface";

export class Module {
    private readonly _id: string;
    private readonly _imports = new Set<Module>();
    private readonly _providers = new Map<InstanceToken, In>
}