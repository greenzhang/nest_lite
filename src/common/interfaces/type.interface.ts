export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}
export type InstanceToken = string | symbol | Type<any> | Function;
