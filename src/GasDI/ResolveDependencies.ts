function ResolveDependencies(scope?: string): ClassDecorator & MethodDecorator {
    scope ||= GasDI.Container.DEFAULT_SCOPE;
    return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor): any {
        if (descriptor) {
            // メソッドデコレータの場合
            const originalMethod = descriptor.value as (...args: any[]) => any;
            descriptor.value = function (...args: any[]): any {
                const injectedParams = target.constructor._injectedParams || {};
                const methodParams = injectedParams[propertyKey] || [];
                methodParams.forEach(({ index, key, optional }: { index: number, key: string, optional: boolean }) => {
                    if (args[index] === undefined) {
                        args[index] = GasDI.Container.resolve(scope, key, optional);
                    }
                });
                return originalMethod.apply(this, args);
            };
        } else {
            // クラスデコレータの場合
            const originalConstructor = target;
            originalConstructor.prototype.constructor._injectScope = scope;
            return class extends originalConstructor {
                constructor(...args: any[]) {
                    const injects = originalConstructor.prototype.constructor._inject || [];
                    injects.forEach(({ key, propertyKey, optional }: { key: string, propertyKey: string, optional: boolean }) => {
                        originalConstructor.prototype[propertyKey] = GasDI.Container.resolve(scope, key, optional);
                    });
                    super(...args);
                }
            }
        }
    };
}
