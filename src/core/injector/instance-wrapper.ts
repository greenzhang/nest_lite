import { v4 as randomStringGenerator } from "uuid";
import { Scope } from "../../common/interfaces/scope.interface";
import { InstanceToken, Type } from "../../common/interfaces/type.interface";
import { isNil, isUndefined } from "../utils";
import { STATIC_CONTEXT } from "./constants";
import { Module } from "./module";
export const INSTANCE_METADATA_SYMBOL = Symbol.for("instance_metadata:cache");
export const INSTANCE_ID_SYMBOL = Symbol.for("instance_metadata:id");

export interface ContextId {
  readonly id: number;
}
export interface InstancePerContext<T> {
  instance: T;
  isResolved?: boolean;
  isPending?: boolean;
  donePromise?: Promise<void>;
}
export interface PropertyMetadata {
  key: string;
  wrapper: InstanceWrapper;
}
interface InstanceMetadataStore {
  dependencies?: InstanceWrapper[];
  properties?: PropertyMetadata[];
  enhancers?: InstanceWrapper[];
}

/**
 * 这是一个实例的包装器
 *
 * @export
 * @class InstanceWrapper
 * @template T
 */
export class InstanceWrapper<T = any> {
  public readonly name: any;
  public readonly token?: InstanceToken;
  public readonly async?: boolean;
  public readonly host?: Module;
  public readonly isAlias: boolean = false;

  public scope?: Scope = Scope.Singleton;
  public metatype: Type<T> | Function;
  public inject?: (string | symbol | Function | Type<any>)[];
  public forwardRef?: boolean;
  private readonly values = new WeakMap<ContextId, InstancePerContext<T>>();
  private readonly [INSTANCE_METADATA_SYMBOL]: InstanceMetadataStore = {};
  private readonly [INSTANCE_ID_SYMBOL]: string;
  private transientMap?:
    | Map<string, WeakMap<ContextId, InstancePerContext<T>>>
    | undefined;
  private isTreeStatic: boolean | undefined;
  constructor(
    metadata: Partial<InstanceWrapper<T>> & Partial<InstancePerContext<T>> = {}
  ) {
    this[INSTANCE_ID_SYMBOL] = randomStringGenerator();
    this.initialize(metadata);
  }
  public addEnhancerMetadata(wrapper: InstanceWrapper) {
    if (!this[INSTANCE_METADATA_SYMBOL].enhancers) {
      this[INSTANCE_METADATA_SYMBOL].enhancers = [];
    }
    this[INSTANCE_METADATA_SYMBOL].enhancers.push(wrapper);
  }
  public addCtorMetadata(index: number, wrapper: InstanceWrapper) {
    if (!this[INSTANCE_METADATA_SYMBOL].dependencies) {
      this[INSTANCE_METADATA_SYMBOL].dependencies = [];
    }
    this[INSTANCE_METADATA_SYMBOL].dependencies[index] = wrapper;
  }
  public setInstanceByInquirerId(
    contextId: ContextId,
    inquirerId: string,
    value: InstancePerContext<T>
  ) {
    let collection = this.transientMap.get(inquirerId);
    if (!collection) {
      collection = new WeakMap();
      this.transientMap.set(inquirerId, collection);
    }
    collection.set(contextId, value);
  }
  public setInstanceByContextId(
    contextId: ContextId,
    value: InstancePerContext<T>,
    inquirerId?: string
  ) {
    if (this.scope === Scope.Transient && inquirerId) {
      return this.setInstanceByInquirerId(contextId, inquirerId, value);
    }
    this.values.set(contextId, value);
  }
  public getInstanceByContextId(
    contextId: ContextId,
    inquirerId?: string
  ): InstancePerContext<T> {
    if (this.scope === Scope.Transient && inquirerId) {
      return this.getInstanceByInquirerId(contextId, inquirerId);
    }
    const instancePerContext = this.values.get(contextId);
    return instancePerContext
      ? instancePerContext
      : this.cloneStaticInstance(contextId);
  }
  public getInstanceByInquirerId(
    contextId: ContextId,
    inquirerId: string
  ): InstancePerContext<T> {
    let collectionPerContext = this.transientMap.get(inquirerId);
    if (!collectionPerContext) {
      collectionPerContext = new WeakMap();
      this.transientMap.set(inquirerId, collectionPerContext);
    }
    const instancePerContext = collectionPerContext.get(contextId);
    return instancePerContext
      ? instancePerContext
      : this.cloneTransientInstance(contextId, inquirerId);
  }
  public cloneStaticInstance(contextId: ContextId): InstancePerContext<T> {
    const staticInstance = this.getInstanceByContextId(STATIC_CONTEXT);
    if (this.isDependencyTreeStatic()) {
      return staticInstance;
    }
    const instancePerContext: InstancePerContext<T> = {
      ...staticInstance,
      instance: undefined,
      isResolved: false,
      isPending: false,
    };
    if (this.isNewable()) {
      instancePerContext.instance = Object.create(this.metatype.prototype);
    }
    this.setInstanceByContextId(contextId, instancePerContext);
    return instancePerContext;
  }
  /**
   * 计算是否是静态实例
   * @param lookupRegistry
   * @returns
   */
  public isDependencyTreeStatic(lookupRegistry: string[] = []): boolean {
    if (!isUndefined(this.isTreeStatic)) {
      return this.isTreeStatic;
    }
    if (this.scope === Scope.ResolutionScoped) {
      this.isTreeStatic = false;
      return this.isTreeStatic;
    }
    if (lookupRegistry.includes(this[INSTANCE_ID_SYMBOL])) {
      return true;
    }
    lookupRegistry = lookupRegistry.concat(this[INSTANCE_ID_SYMBOL]);

    const { dependencies, properties, enhancers } = this[
      INSTANCE_METADATA_SYMBOL
    ];
    let isStatic =
      (dependencies &&
        this.isWrapperListStatic(dependencies, lookupRegistry)) ||
      !dependencies;

    if (!isStatic || !(properties || enhancers)) {
      this.isTreeStatic = isStatic;
      return this.isTreeStatic;
    }
    const propertiesHosts = (properties || []).map((item) => item.wrapper);
    isStatic =
      isStatic && this.isWrapperListStatic(propertiesHosts, lookupRegistry);
    if (!isStatic || !enhancers) {
      this.isTreeStatic = isStatic;
      return this.isTreeStatic;
    }
    this.isTreeStatic = this.isWrapperListStatic(enhancers, lookupRegistry);
    return this.isTreeStatic;
  }
  private isWrapperListStatic(
    tree: InstanceWrapper[],
    lookupRegistry: string[]
  ): boolean {
    return tree.every((item: InstanceWrapper) =>
      item.isDependencyTreeStatic(lookupRegistry)
    );
  }
  public cloneTransientInstance(
    contextId: ContextId,
    inquirerId: string
  ): InstancePerContext<T> {
    const staticInstance = this.getInstanceByContextId(STATIC_CONTEXT);
    const instancePerContext: InstancePerContext<T> = {
      ...staticInstance,
      instance: undefined,
      isResolved: false,
      isPending: false,
    };
    if (this.isNewable()) {
      instancePerContext.instance = Object.create(this.metatype.prototype);
    }
    this.setInstanceByInquirerId(contextId, inquirerId, instancePerContext);
    return instancePerContext;
  }
  private isNewable(): boolean {
    return isNil(this.inject) && this.metatype && this.metatype.prototype;
  }
  private initialize(
    metadata: Partial<InstanceWrapper<T>> & Partial<InstancePerContext<T>>
  ) {
    const { instance, isResolved, ...wrapperPartial } = metadata;
    Object.assign(this, wrapperPartial);

    this.setInstanceByContextId(STATIC_CONTEXT, {
      // @ts-ignore
      instance,
      isResolved,
    });
    this.scope === Scope.Transient && (this.transientMap = new Map());
  }
}
