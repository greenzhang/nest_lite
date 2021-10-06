import { Scope } from "../../../common/interfaces/scope.interface";
import { STATIC_CONTEXT } from "../../injector/constants";
import { InstanceWrapper } from "../../injector/instance-wrapper";

class TestClass {}

describe("InstanceWrapper", () => {
  describe("initialize", () => {
    const partial = {
      name: "test",
      metatype: TestClass,
      scope: Scope.Transient,
      instance: new TestClass(),
    };
    it("should assign partial", () => {
      const instance = new InstanceWrapper(partial);
      expect(instance.name).toEqual(partial.name);
      expect(instance.scope).toEqual(partial.scope);
      expect(instance.metatype).toEqual(partial.metatype);
    });
    it("should set instance by context id", () => {
      const instance = new InstanceWrapper(partial);
      expect(instance.getInstanceByContextId(STATIC_CONTEXT).instance).toEqual(
        partial.instance
      );
    });
  });
  describe('isDependencyTreeStatic', () => {
    describe('when request scoped', () => {
      it('should return false', () => {
        const wrapper = new InstanceWrapper({
          scope: Scope.ResolutionScoped,
        });
        expect(wrapper.isDependencyTreeStatic()).toBeFalsy();
      });
    });
    // describe('when statically scoped', () => {
    //   describe('dependencies', () => {
    //     describe('when each is static', () => {
    //       it('should return true', () => {
    //         const wrapper = new InstanceWrapper();
    //         wrapper.addCtorMetadata(0, new InstanceWrapper());
    //         expect(wrapper.isDependencyTreeStatic()).to.be.true;
    //       });
    //     });
    //     describe('when one is not static', () => {
    //       it('should return false', () => {
    //         const wrapper = new InstanceWrapper();
    //         wrapper.addCtorMetadata(0, new InstanceWrapper());
    //         wrapper.addCtorMetadata(
    //           1,
    //           new InstanceWrapper({
    //             scope: Scope.REQUEST,
    //           }),
    //         );
    //         expect(wrapper.isDependencyTreeStatic()).to.be.false;
    //       });
    //     });
    //   });
    //   describe('properties', () => {
    //     describe('when each is static', () => {
    //       it('should return true', () => {
    //         const wrapper = new InstanceWrapper();
    //         wrapper.addPropertiesMetadata('key1', new InstanceWrapper());
    //         wrapper.addPropertiesMetadata('key2', new InstanceWrapper());
    //         expect(wrapper.isDependencyTreeStatic()).to.be.true;
    //       });
    //     });
    //     describe('when one is not static', () => {
    //       it('should return false', () => {
    //         const wrapper = new InstanceWrapper();
    //         wrapper.addPropertiesMetadata(
    //           'key1',
    //           new InstanceWrapper({ scope: Scope.REQUEST }),
    //         );
    //         wrapper.addPropertiesMetadata('key2', new InstanceWrapper());
    //         expect(wrapper.isDependencyTreeStatic()).to.be.false;
    //       });
    //     });
    //   });
    //   describe('enhancers', () => {
    //     describe('when each is static', () => {
    //       it('should return true', () => {
    //         const wrapper = new InstanceWrapper();
    //         wrapper.addEnhancerMetadata(new InstanceWrapper());
    //         wrapper.addEnhancerMetadata(new InstanceWrapper());
    //         expect(wrapper.isDependencyTreeStatic()).toBeTruthy();
    //       });
    //     });
    //     describe('when one is not static', () => {
    //       it('should return false', () => {
    //         const wrapper = new InstanceWrapper();
    //         wrapper.addEnhancerMetadata(
    //           new InstanceWrapper({ scope: Scope.Singleton }),
    //         );
    //         wrapper.addEnhancerMetadata(new InstanceWrapper());
    //         expect(wrapper.isDependencyTreeStatic()).toBeFalsy();
    //       });
    //     });
    //   });
    // });
  });
});
