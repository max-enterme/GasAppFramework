function Injectable(key: string, optional: boolean = false) {
    return function (target: any, propertyKey?: string | symbol, arg?: number | PropertyDescriptor) {
        if (typeof arg === 'number') {
            // 引数デコレータの場合
            const parameterIndex = arg;
            const existingInjectedParams = target.constructor._injectedParams || [];
            const methodParams = existingInjectedParams[propertyKey] || [];
            methodParams.push({ index: parameterIndex, key, optional });
            existingInjectedParams[propertyKey] = methodParams;
            target.constructor._injectedParams = existingInjectedParams;
        }
        else if (arg) {
            // アクセサデコレータの場合
            const descriptor = arg;
            descriptor.get = function () {
                if (!this[`_${String(propertyKey)}`]) {
                    const scope = this.constructor._injectScope || GasDI.Container.DEFAULT_SCOPE;
                    this[`_${String(propertyKey)}`] = GasDI.Container.resolve(scope, key, optional);
                }
                return this[`_${String(propertyKey)}`];
            };
        }
        else {
            // プロパティデコレータの場合
            const injects = target.constructor._inject || [];
            injects.push({ key, propertyKey, optional });
            target.constructor._inject = injects;
        }
    };
}
