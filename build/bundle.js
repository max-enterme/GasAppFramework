function Container() {
}
function Context() {
}
function Inject() {
}
function Resolve() {
}
function DomainError() {
}
function ensureTimeZone() {
}
function format() {
}var GasAppFramework;
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Container: () => (/* reexport */ Container),
  Context: () => (/* reexport */ Context),
  DI: () => (/* reexport */ di_namespaceObject),
  DomainError: () => (/* reexport */ DomainError),
  Inject: () => (/* reexport */ Inject),
  Resolve: () => (/* reexport */ Resolve),
  Shared: () => (/* reexport */ shared_namespaceObject),
  ensureTimeZone: () => (/* reexport */ ensureTimeZone),
  formatDate: () => (/* reexport */ format)
});

// NAMESPACE OBJECT: ./modules/di/index.ts
var di_namespaceObject = {};
__webpack_require__.r(di_namespaceObject);
__webpack_require__.d(di_namespaceObject, {
  Container: () => (Container),
  Context: () => (Context),
  Inject: () => (Inject),
  Resolve: () => (Resolve)
});

// NAMESPACE OBJECT: ./modules/shared/index.ts
var shared_namespaceObject = {};
__webpack_require__.r(shared_namespaceObject);
__webpack_require__.d(shared_namespaceObject, {
  DomainError: () => (DomainError),
  ensureTimeZone: () => (ensureTimeZone),
  format: () => (format)
});

;// ./modules/di/Types.ts
/**
 * GasDI Types - ES Modules版
 * Dependency Injection Container の型定義
 */


;// ./modules/di/Container.ts
/**
 * GasDI Container - ES Modules版
 * Dependency Injection Container with support for multiple lifetimes
 */
/**
 * Dependency injection container with support for multiple lifetimes
 */
class Container {
    constructor(parent) {
        this.registers = new Map();
        this.singletons = new Map();
        this.scopedByName = new Map(); // scopeName -> (token -> instance)
        this.parent = parent;
    }
    createScope(name) {
        const child = new Container(this);
        child._scopeName = name && name.trim().length ? name : `request-${Date.now()}`;
        return child;
    }
    registerValue(token, value) {
        this.registers.set(token, { kind: 'value', token, value });
        return this;
    }
    registerFactory(token, make, lifetime = 'transient') {
        this.registers.set(token, { kind: 'factory', token, lifetime, make });
        return this;
    }
    registerClass(token, ctor, lifetime = 'transient') {
        return this.registerFactory(token, () => new ctor(), lifetime);
    }
    resolve(token, opts) {
        const optional = !!(opts && opts.optional);
        const scopeName = this._scopeName || Container.DEFAULT_SCOPE;
        const got = this.tryResolve(token, scopeName);
        if (got === undefined && !optional)
            throw new Error(`DI token not found: ${token}`);
        return got;
    }
    tryResolve(token, scopeName) {
        const reg = this.registers.get(token);
        if (reg)
            return this.instantiate(reg, scopeName);
        if (this.parent) {
            const parentVal = this.parent.tryResolve(token, scopeName);
            if (parentVal !== undefined)
                return parentVal;
        }
        return undefined;
    }
    instantiate(reg, scopeName) {
        if (reg.kind === 'value')
            return reg.value;
        if (reg.lifetime === 'singleton') {
            if (this.singletons.has(reg.token))
                return this.singletons.get(reg.token);
            const v = reg.make();
            this.singletons.set(reg.token, v);
            return v;
        }
        if (reg.lifetime === 'scoped') {
            const name = scopeName || Container.DEFAULT_SCOPE;
            let bag = this.scopedByName.get(name);
            if (!bag) {
                bag = new Map();
                this.scopedByName.set(name, bag);
            }
            if (bag.has(reg.token))
                return bag.get(reg.token);
            const v = reg.make();
            bag.set(reg.token, v);
            return v;
        }
        return reg.make();
    }
    /**
     * Disposes the scoped container and cleans up scoped instances
     * Should be called after Context.run to prevent resource leaks
     * Only cleans up resources for scoped containers (those with a scope name)
     *
     * Note: Scoped containers typically don't have their own registrations,
     * they inherit from parent. This method focuses on cleaning up instances.
     */
    dispose() {
        if (this._scopeName) {
            // Clear scoped instances for this scope from parent container
            if (this.parent) {
                this.parent.scopedByName.delete(this._scopeName);
            }
            // Clear local scoped instances
            this.scopedByName.clear();
        }
    }
}
Container.Root = new Container();
Container.DEFAULT_SCOPE = 'default';

;// ./modules/di/Context.ts
/**
 * GasDI Context - ES Modules版
 * DI Container context management
 */

class Context {
    static run(container, fn) {
        const prev = this.current;
        Context._current = container;
        try {
            return fn();
        }
        finally {
            Context._current = prev;
        }
    }
    static get current() {
        var _a;
        return (_a = Context._current) !== null && _a !== void 0 ? _a : Container.Root;
    }
}

;// ./modules/di/Decorators.ts
/**
 * GasDI Decorators - ES Modules版
 * Dependency Injection Decorators for constructor and property injection
 */

function Inject(token, optional = false) {
    return function (target, propertyKey, paramIndex) {
        if (typeof paramIndex === 'number') {
            // Parameter injection
            const tableKey = propertyKey ? String(propertyKey) : '__ctor__';
            const targetCtor = propertyKey ? target.constructor : target;
            const meta = targetCtor._injectedParams || {};
            const list = meta[tableKey] || [];
            list.push({ index: paramIndex, token, optional });
            meta[tableKey] = list;
            targetCtor._injectedParams = meta;
        }
        else if (propertyKey) {
            // Property injection
            const injects = (target.constructor._inject || []);
            injects.push({ propertyKey: String(propertyKey), token, optional });
            target.constructor._inject = injects;
        }
    };
}
function Resolve() {
    return function (target, propertyKey, descriptor) {
        if (descriptor) {
            // Method decorator
            const original = descriptor.value;
            descriptor.value = function (...args) {
                const injectedParams = target.constructor._injectedParams || {};
                const defs = injectedParams[propertyKey ? String(propertyKey) : ''] || [];
                for (const d of defs) {
                    if (args[d.index] === undefined) {
                        args[d.index] = Context.current.resolve(d.token, { optional: d.optional });
                    }
                }
                return original.apply(this, args);
            };
            return descriptor;
        }
        else {
            // Class decorator
            const orig = target;
            return class extends orig {
                constructor(...args) {
                    // Constructor params injection
                    const injectedParams = orig._injectedParams || {};
                    const ctorDefs = injectedParams['__ctor__'] || [];
                    for (const d of ctorDefs) {
                        if (args[d.index] === undefined) {
                            args[d.index] = Context.current.resolve(d.token, { optional: d.optional });
                        }
                    }
                    super(...args);
                    // Properties injection
                    const injects = orig._inject || [];
                    for (const it of injects) {
                        this[it.propertyKey] = Context.current.resolve(it.token, {
                            optional: it.optional
                        });
                    }
                    // Methods with param injection
                    const keys = Object.keys(injectedParams).filter((k) => k !== '__ctor__');
                    for (const k of keys) {
                        const defs = injectedParams[k];
                        const originalMethod = orig.prototype[k];
                        if (typeof originalMethod !== 'function')
                            continue;
                        this[k] = (...margs) => {
                            const arr = margs.slice();
                            for (const d of defs) {
                                if (arr[d.index] === undefined) {
                                    arr[d.index] = Context.current.resolve(d.token, { optional: d.optional });
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
__webpack_require__.g.Inject = __webpack_exports__.Inject;
__webpack_require__.g.Resolve = __webpack_exports__.Resolve;
;// ./modules/di/index.ts
/**
 * GasDI - ES Modules版エントリーポイント
 * Dependency Injection module
 */




__webpack_require__.g.Container = __webpack_exports__.Container;
__webpack_require__.g.Context = __webpack_exports__.Context;
__webpack_require__.g.Inject = __webpack_exports__.Inject;
__webpack_require__.g.Resolve = __webpack_exports__.Resolve;
;// ./modules/shared/Time.ts
/**
 * Shared Time Utilities - ES Modules版
 */
function ensureTimeZone(tz) {
    const s = (tz !== null && tz !== void 0 ? tz : '').trim();
    if (s)
        return s;
    try {
        if (typeof Session !== 'undefined' && Session.getScriptTimeZone) {
            return Session.getScriptTimeZone() || 'Etc/GMT';
        }
    }
    catch { }
    return 'Etc/GMT';
}
function format(date, pattern, tz) {
    const zone = ensureTimeZone(tz);
    try {
        if (typeof Utilities !== 'undefined' && Utilities.formatDate) {
            return Utilities.formatDate(date, zone, pattern);
        }
    }
    catch { }
    // fallback (UTC-like simple tokens)
    const pad = (n, w = 2) => String(n).padStart(w, '0');
    const d = new Date(date.getTime());
    const y = d.getUTCFullYear();
    const M = pad(d.getUTCMonth() + 1);
    const dd = pad(d.getUTCDate());
    const H = pad(d.getUTCHours());
    const m = pad(d.getUTCMinutes());
    const s = pad(d.getUTCSeconds());
    return pattern
        .replace(/yyyy/g, String(y))
        .replace(/MM/g, M)
        .replace(/dd/g, dd)
        .replace(/HH/g, H)
        .replace(/mm/g, m)
        .replace(/ss/g, s);
}
__webpack_require__.g.ensureTimeZone = __webpack_exports__.ensureTimeZone;
__webpack_require__.g.format = __webpack_exports__.format;
;// ./modules/shared/Errors.ts
/**
 * Shared Errors - ES Modules版
 */
class DomainError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'DomainError';
    }
    static invalidArg(msg) {
        return new DomainError('InvalidArg', msg);
    }
    static notFound(msg) {
        return new DomainError('NotFound', msg);
    }
    static state(msg) {
        return new DomainError('State', msg);
    }
}

;// ./modules/shared/index.ts
/**
 * Shared Utilities - ES Modules版エントリーポイント
 */



;// ./modules/index.ts
/**
 * GasAppFramework - ES Modules版エントリーポイント
 * Core modules for GAS applications
 */
// DI Module


// Shared Utilities



__webpack_require__.g.Container = __webpack_exports__.Container;
__webpack_require__.g.Context = __webpack_exports__.Context;
__webpack_require__.g.Inject = __webpack_exports__.Inject;
__webpack_require__.g.Resolve = __webpack_exports__.Resolve;
__webpack_require__.g.DomainError = __webpack_exports__.DomainError;
__webpack_require__.g.ensureTimeZone = __webpack_exports__.ensureTimeZone;
__webpack_require__.g.format = __webpack_exports__.format;
GasAppFramework = __webpack_exports__;
/******/ })()
;