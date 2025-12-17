namespace GasDI.Decorators {
    type Token<T = any> = GasDI.Ports.Token<T>

    export function Inject(token: Token, optional = false): PropertyDecorator & ParameterDecorator {
        return function (target: any, propertyKey: string | symbol | undefined, paramIndex?: number) {
            if (typeof paramIndex === 'number') {
                const tableKey = propertyKey ? String(propertyKey) : '__ctor__';
                const targetCtor = propertyKey ? target.constructor : target;
                const meta = targetCtor._injectedParams || {};
                const list = meta[tableKey] || [];
                list.push({ index: paramIndex, token, optional });
                meta[tableKey] = list;
                targetCtor._injectedParams = meta;
            } else if (propertyKey) {
                const injects = (target.constructor._inject || []) as any[];
                injects.push({ propertyKey: String(propertyKey), token, optional });
                target.constructor._inject = injects;
            }
        } as any;
    }

    export function Resolve(): ClassDecorator & MethodDecorator {
        return function (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
            if (descriptor) {
                const original = descriptor.value as (...args: any[]) => any;
                descriptor.value = function (...args: any[]) {
                    const injectedParams = (target.constructor as any)._injectedParams || {};
                    const defs = injectedParams[propertyKey ? String(propertyKey) : ''] || [];
                    for (const d of defs) {
                        if (args[d.index] === undefined) {
                            args[d.index] = GasDI.Context.current.resolve(d.token, { optional: d.optional });
                        }
                    }
                    return original.apply(this, args);
                };
                return descriptor;
            } else {
                const orig = target;
                return class extends orig {
                    constructor(...args: any[]) {
                        // constructor params
                        const injectedParams = (orig as any)._injectedParams || {};
                        const ctorDefs = injectedParams['__ctor__'] || [];
                        for (const d of ctorDefs) {
                            if (args[d.index] === undefined) {
                                args[d.index] = GasDI.Context.current.resolve(d.token, { optional: d.optional });
                            }
                        }
                        super(...args);
                        // properties
                        const injects = (orig as any)._inject || [];
                        for (const it of injects) {
                            (this as any)[it.propertyKey] = GasDI.Context.current.resolve(it.token, { optional: it.optional });
                        }
                        // methods with param injection
                        const keys = Object.keys(injectedParams).filter(k => k !== '__ctor__');
                        for (const k of keys) {
                            const defs = injectedParams[k];
                            const originalMethod = (orig as any).prototype[k];
                            if (typeof originalMethod !== 'function') continue;
                            (this as any)[k] = (...margs: any[]) => {
                                const arr = margs.slice();
                                for (const d of defs) {
                                    if (arr[d.index] === undefined) {
                                        arr[d.index] = GasDI.Context.current.resolve(d.token, { optional: d.optional });
                                    }
                                }
                                return originalMethod.apply(this, arr);
                            };
                        }
                    }
                };
            }
        };
    }
}
