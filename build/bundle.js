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
  Locking: () => (/* reexport */ locking_namespaceObject),
  Repository: () => (/* reexport */ repository_namespaceObject),
  Resolve: () => (/* reexport */ Resolve),
  RestFramework: () => (/* reexport */ rest_framework_namespaceObject),
  Routing: () => (/* reexport */ routing_namespaceObject),
  Shared: () => (/* reexport */ shared_namespaceObject),
  StringHelper: () => (/* reexport */ string_helper_namespaceObject),
  TestRunner: () => (/* reexport */ test_runner_namespaceObject),
  Testing: () => (/* reexport */ testing_namespaceObject),
  ensureTimeZone: () => (/* reexport */ ensureTimeZone),
  formatDate: () => (/* reexport */ format)
});

// NAMESPACE OBJECT: ./modules/di/index.ts
var di_namespaceObject = {};
__webpack_require__.r(di_namespaceObject);
__webpack_require__.d(di_namespaceObject, {
  Container: () => (Container),
  Context: () => (Context),
  GenericFactory: () => (GenericFactory),
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

// NAMESPACE OBJECT: ./modules/locking/Types.ts
var locking_Types_namespaceObject = {};
__webpack_require__.r(locking_Types_namespaceObject);

// NAMESPACE OBJECT: ./modules/locking/Engine.ts
var Engine_namespaceObject = {};
__webpack_require__.r(Engine_namespaceObject);
__webpack_require__.d(Engine_namespaceObject, {
  create: () => (create)
});

// NAMESPACE OBJECT: ./modules/locking/Adapters.ts
var Adapters_namespaceObject = {};
__webpack_require__.r(Adapters_namespaceObject);
__webpack_require__.d(Adapters_namespaceObject, {
  GasLogger: () => (GasLogger),
  PropertiesStore: () => (PropertiesStore),
  SystemClock: () => (SystemClock)
});

// NAMESPACE OBJECT: ./modules/locking/index.ts
var locking_namespaceObject = {};
__webpack_require__.r(locking_namespaceObject);
__webpack_require__.d(locking_namespaceObject, {
  Adapters: () => (Adapters_namespaceObject),
  Engine: () => (Engine_namespaceObject),
  Types: () => (locking_Types_namespaceObject)
});

// NAMESPACE OBJECT: ./modules/repository/Types.ts
var repository_Types_namespaceObject = {};
__webpack_require__.r(repository_Types_namespaceObject);

// NAMESPACE OBJECT: ./modules/repository/Engine.ts
var repository_Engine_namespaceObject = {};
__webpack_require__.r(repository_Engine_namespaceObject);
__webpack_require__.d(repository_Engine_namespaceObject, {
  create: () => (Engine_create)
});

// NAMESPACE OBJECT: ./modules/repository/Codec.ts
var Codec_namespaceObject = {};
__webpack_require__.r(Codec_namespaceObject);
__webpack_require__.d(Codec_namespaceObject, {
  simple: () => (simple)
});

// NAMESPACE OBJECT: ./modules/repository/SchemaFactory.ts
var SchemaFactory_namespaceObject = {};
__webpack_require__.r(SchemaFactory_namespaceObject);
__webpack_require__.d(SchemaFactory_namespaceObject, {
  createFromPartial: () => (createFromPartial),
  createSchema: () => (createSchema),
  getParametersFromEntity: () => (getParametersFromEntity)
});

// NAMESPACE OBJECT: ./modules/repository/index.ts
var repository_namespaceObject = {};
__webpack_require__.r(repository_namespaceObject);
__webpack_require__.d(repository_namespaceObject, {
  Codec: () => (Codec_namespaceObject),
  Engine: () => (repository_Engine_namespaceObject),
  MemoryStore: () => (MemoryStore),
  RepositoryError: () => (RepositoryError),
  SchemaFactory: () => (SchemaFactory_namespaceObject),
  SpreadsheetStore: () => (SpreadsheetStore),
  Types: () => (repository_Types_namespaceObject)
});

// NAMESPACE OBJECT: ./modules/routing/Types.ts
var routing_Types_namespaceObject = {};
__webpack_require__.r(routing_Types_namespaceObject);

// NAMESPACE OBJECT: ./modules/routing/Engine.ts
var routing_Engine_namespaceObject = {};
__webpack_require__.r(routing_Engine_namespaceObject);
__webpack_require__.d(routing_Engine_namespaceObject, {
  create: () => (routing_Engine_create)
});

// NAMESPACE OBJECT: ./modules/routing/index.ts
var routing_namespaceObject = {};
__webpack_require__.r(routing_namespaceObject);
__webpack_require__.d(routing_namespaceObject, {
  Engine: () => (routing_Engine_namespaceObject),
  Types: () => (routing_Types_namespaceObject)
});

// NAMESPACE OBJECT: ./modules/string-helper/index.ts
var string_helper_namespaceObject = {};
__webpack_require__.r(string_helper_namespaceObject);
__webpack_require__.d(string_helper_namespaceObject, {
  formatDate: () => (formatDate),
  formatString: () => (formatString),
  get: () => (get),
  resolveString: () => (resolveString)
});

// NAMESPACE OBJECT: ./modules/rest-framework/Types.ts
var rest_framework_Types_namespaceObject = {};
__webpack_require__.r(rest_framework_Types_namespaceObject);

// NAMESPACE OBJECT: ./modules/rest-framework/index.ts
var rest_framework_namespaceObject = {};
__webpack_require__.r(rest_framework_namespaceObject);
__webpack_require__.d(rest_framework_namespaceObject, {
  ApiController: () => (ApiController),
  ApiResponseFormatter: () => (ApiResponseFormatter),
  ErrorHandler: () => (ErrorHandler),
  FieldType: () => (FieldType),
  Logger: () => (Logger_Logger),
  NormalizedRequestMapper: () => (NormalizedRequestMapper),
  SchemaRequestMapper: () => (SchemaRequestMapper),
  Types: () => (rest_framework_Types_namespaceObject),
  coerceParamValue: () => (coerceParamValue),
  executeRoute: () => (executeRoute),
  normalizeDoGet: () => (normalizeDoGet),
  normalizeDoPost: () => (normalizeDoPost),
  tryCoerceNumber: () => (tryCoerceNumber)
});

// NAMESPACE OBJECT: ./modules/testing/Test.ts
var Test_namespaceObject = {};
__webpack_require__.r(Test_namespaceObject);
__webpack_require__.d(Test_namespaceObject, {
  all: () => (Test_all),
  byCategory: () => (byCategory),
  categories: () => (categories),
  clear: () => (clear),
  getCaseWithCategory: () => (getCaseWithCategory),
  it: () => (it)
});

// NAMESPACE OBJECT: ./modules/testing/Runner.ts
var Runner_namespaceObject = {};
__webpack_require__.r(Runner_namespaceObject);
__webpack_require__.d(Runner_namespaceObject, {
  runAll: () => (runAll),
  runByCategory: () => (runByCategory),
  summarize: () => (summarize)
});

// NAMESPACE OBJECT: ./modules/testing/Assert.ts
var Assert_namespaceObject = {};
__webpack_require__.r(Assert_namespaceObject);
__webpack_require__.d(Assert_namespaceObject, {
  contains: () => (contains),
  equals: () => (equals),
  fail: () => (fail),
  hasLength: () => (hasLength),
  isFalse: () => (isFalse),
  isTrue: () => (isTrue),
  notNull: () => (notNull),
  strictEquals: () => (strictEquals),
  throws: () => (Assert_throws)
});

// NAMESPACE OBJECT: ./modules/testing/GasReporter.ts
var GasReporter_namespaceObject = {};
__webpack_require__.r(GasReporter_namespaceObject);
__webpack_require__.d(GasReporter_namespaceObject, {
  print: () => (print),
  printCategory: () => (printCategory),
  toHtml: () => (toHtml)
});

// NAMESPACE OBJECT: ./modules/testing/TestHelpers.ts
var TestHelpers_namespaceObject = {};
__webpack_require__.r(TestHelpers_namespaceObject);
__webpack_require__.d(TestHelpers_namespaceObject, {
  Assertions: () => (Assertions),
  MockClock: () => (MockClock),
  MockLogger: () => (MockLogger)
});

// NAMESPACE OBJECT: ./modules/testing/index.ts
var testing_namespaceObject = {};
__webpack_require__.r(testing_namespaceObject);
__webpack_require__.d(testing_namespaceObject, {
  Assert: () => (Assert_namespaceObject),
  GasReporter: () => (GasReporter_namespaceObject),
  Runner: () => (Runner_namespaceObject),
  Test: () => (Test_namespaceObject),
  TestHelpers: () => (TestHelpers_namespaceObject)
});

// NAMESPACE OBJECT: ./modules/test-runner/HtmlReporter.ts
var HtmlReporter_namespaceObject = {};
__webpack_require__.r(HtmlReporter_namespaceObject);
__webpack_require__.d(HtmlReporter_namespaceObject, {
  generate: () => (generate),
  toJson: () => (toJson)
});

// NAMESPACE OBJECT: ./modules/test-runner/index.ts
var test_runner_namespaceObject = {};
__webpack_require__.r(test_runner_namespaceObject);
__webpack_require__.d(test_runner_namespaceObject, {
  HtmlReporter: () => (HtmlReporter_namespaceObject),
  WebTestRunner: () => (WebTestRunner),
  createDoGetHandler: () => (createDoGetHandler)
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
;// ./modules/di/GenericFactory.ts
/**
 * Generic Factory - Simple implementation of Factory interface
 */
/**
 * Generic factory that instantiates classes using their constructor
 */
class GenericFactory {
    constructor(ctor) {
        this.ctor = ctor;
    }
    instantiate() {
        return new this.ctor();
    }
}

;// ./modules/di/index.ts
/**
 * GasDI - ES Modules版エントリーポイント
 * Dependency Injection module
 */





__webpack_require__.g.Container = __webpack_exports__.Container;
__webpack_require__.g.Context = __webpack_exports__.Context;
__webpack_require__.g.Inject = __webpack_exports__.Inject;
__webpack_require__.g.Resolve = __webpack_exports__.Resolve;
__webpack_require__.g.GenericFactory = __webpack_exports__.GenericFactory;
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

;// ./modules/shared/CommonTypes.ts
/**
 * Common shared types used across multiple modules
 */


;// ./modules/shared/index.ts
/**
 * Shared Utilities - ES Modules版エントリーポイント
 */




;// ./modules/locking/Types.ts
/**
 * Locking Module - Type Definitions
 */


;// ./modules/locking/Engine.ts
/**
 * Locking Module - Engine Implementation
 */
const DEFAULT_TTL = 30000;
function keyOf(ns, resourceId) {
    return `${ns}${resourceId}`;
}
function parse(json) {
    if (!json)
        return { version: 1, entries: [] };
    try {
        const s = JSON.parse(json);
        if (!s || !Array.isArray(s.entries))
            return { version: 1, entries: [] };
        return {
            version: typeof s.version === 'number' ? s.version : 1,
            entries: s.entries.map((e) => ({
                token: String(e.token),
                owner: e.owner == null ? null : String(e.owner),
                mode: e.mode === 'w' ? 'w' : 'r',
                expireMs: Number(e.expireMs) || 0
            }))
        };
    }
    catch {
        return { version: 1, entries: [] };
    }
}
function serialize(s) {
    return JSON.stringify(s);
}
function gc(s, nowMs) {
    return { ...s, entries: s.entries.filter((e) => e.expireMs > nowMs) };
}
function genToken(resourceId, rand, nowMs) {
    const r = rand ? rand.next() : Math.random();
    return `${resourceId}-${nowMs}-${Math.floor(r * 1e9)}`;
}
function create(deps) {
    var _a;
    const ns = (_a = deps.namespace) !== null && _a !== void 0 ? _a : 'lock:';
    function acquire(resourceId, mode, ttlMs = DEFAULT_TTL, owner = null) {
        try {
            const now = deps.clock.now().getTime();
            const key = keyOf(ns, resourceId);
            const st = gc(parse(deps.store.get(key)), now);
            // admission
            if (mode === 'r') {
                const hasWriter = st.entries.some((e) => e.mode === 'w');
                if (hasWriter)
                    return { ok: false, reason: 'writer-present' };
            }
            else {
                // 'w'
                const hasAny = st.entries.length > 0;
                if (hasAny)
                    return { ok: false, reason: 'busy' };
            }
            const token = genToken(resourceId, deps.rand, now);
            st.entries.push({ token, owner, mode, expireMs: now + Math.max(1, ttlMs) });
            deps.store.set(key, serialize(st));
            const expireIso = new Date(now + Math.max(1, ttlMs)).toISOString();
            if (deps.logger) {
                deps.logger.info(`Lock acquired for resource ${resourceId} (${mode}) by ${owner || 'anonymous'}`);
            }
            return { ok: true, token, expireIso, mode, owner };
        }
        catch (error) {
            if (deps.logger) {
                deps.logger.error('Properties service error');
            }
            throw error;
        }
    }
    function extend(resourceId, token, ttlMs = DEFAULT_TTL) {
        const now = deps.clock.now().getTime();
        const key = keyOf(ns, resourceId);
        const st = gc(parse(deps.store.get(key)), now);
        const idx = st.entries.findIndex((e) => e.token === token);
        if (idx < 0)
            return { ok: false, reason: 'not-held' };
        st.entries[idx].expireMs = now + Math.max(1, ttlMs);
        deps.store.set(key, serialize(st));
        return { ok: true, expireIso: new Date(st.entries[idx].expireMs).toISOString() };
    }
    function release(resourceId, token) {
        const now = deps.clock.now().getTime();
        const key = keyOf(ns, resourceId);
        const st = gc(parse(deps.store.get(key)), now);
        const next = { ...st, entries: st.entries.filter((e) => e.token !== token) };
        if (next.entries.length === st.entries.length)
            return { ok: false, reason: 'not-held' };
        deps.store.set(key, serialize(next));
        return { ok: true };
    }
    function inspect(resourceId) {
        const now = deps.clock.now().getTime();
        const key = keyOf(ns, resourceId);
        return gc(parse(deps.store.get(key)), now);
    }
    return { acquire, extend, release, inspect };
}
__webpack_require__.g.create = __webpack_exports__.create;
;// ./modules/locking/Adapters.ts
/**
 * Locking Module - GAS Adapters
 */
/**
 * PropertiesService adapter for lock storage
 */
class PropertiesStore {
    constructor(prefix = 'lock:') {
        this.prefix = prefix;
    }
    get(key) {
        var _a;
        const p = PropertiesService.getScriptProperties();
        return (_a = p.getProperty(this.prefix + key)) !== null && _a !== void 0 ? _a : null;
    }
    set(key, value) {
        PropertiesService.getScriptProperties().setProperty(this.prefix + key, value);
    }
    del(key) {
        PropertiesService.getScriptProperties().deleteProperty(this.prefix + key);
    }
}
/**
 * System clock implementation
 */
class SystemClock {
    now() {
        return new Date();
    }
}
/**
 * GAS Logger implementation
 */
class GasLogger {
    info(msg) {
        Logger.log(msg);
    }
    error(msg) {
        Logger.log(msg);
    }
}

;// ./modules/locking/index.ts
/**
 * Locking Module - Entry Point
 */




;// ./modules/repository/Types.ts
/**
 * Repository Module - Type Definitions
 */


;// ./modules/repository/Errors.ts
/**
 * Repository Module - Error Classes
 */
class RepositoryError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'RepositoryError';
    }
}

;// ./modules/repository/Engine.ts
/**
 * Repository Engine - Core repository functionality
 */

/**
 * Creates a repository instance with the provided dependencies
 * @param deps Configuration object with schema, store, codec, and optional logger
 * @returns Repository instance with CRUD operations
 */
function Engine_create(deps) {
    var _a;
    const logger = (_a = deps.logger) !== null && _a !== void 0 ? _a : { info: (_) => { }, error: (_) => { } };
    let rows = [];
    let idx = new Map();
    /**
     * Extract key from entity based on schema key parameters
     */
    const keyOf = (e) => {
        const key = {};
        for (const param of deps.schema.keyParameters) {
            key[param] = e[param];
        }
        return key;
    };
    /**
     * Serialize key to string for indexing
     */
    const keyToString = (key) => {
        return deps.keyCodec.stringify(key);
    };
    /**
     * Rebuild index from current rows
     */
    const buildIndex = () => {
        idx = new Map();
        for (let i = 0; i < rows.length; i++) {
            const key = keyToString(keyOf(rows[i]));
            idx.set(key, i);
        }
    };
    /**
     * Load entities from store and build index
     */
    function load() {
        const read = deps.store.load();
        rows = read.rows.map((row) => {
            const entity = deps.schema.onAfterLoad
                ? deps.schema.onAfterLoad(row)
                : row;
            return coerceToSchema(entity);
        });
        buildIndex();
        logger.info(`[Repository] loaded ${rows.length} rows`);
    }
    /**
     * Coerce partial entity to full entity using schema
     */
    function coerceToSchema(partial) {
        const entity = deps.schema.fromPartial(partial);
        return deps.schema.onBeforeSave ? deps.schema.onBeforeSave(entity) : entity;
    }
    function find(key) {
        ensureLoaded();
        const i = idx.get(keyToString(key));
        return i == null ? null : rows[i];
    }
    function findAll(keys) {
        ensureLoaded();
        const out = [];
        for (const k of keys) {
            const i = idx.get(keyToString(k));
            if (i != null)
                out.push(rows[i]);
        }
        return out;
    }
    /**
     * Insert or update entities
     */
    function upsert(input) {
        ensureLoaded();
        const items = Array.isArray(input) ? input : [input];
        const added = [];
        const updated = [];
        const forStoreAdds = [];
        const forStoreUpdates = [];
        for (const partial of items) {
            const entity = coerceToSchema(partial);
            const key = keyOf(entity);
            validateKey(key);
            const keyStr = keyToString(key);
            const existingIndex = idx.get(keyStr);
            if (existingIndex == null) {
                // Add new entity
                const newIndex = rows.length;
                rows.push(entity);
                idx.set(keyStr, newIndex);
                added.push(entity);
                forStoreAdds.push(entity);
                logger.info(`[Repository] added entity with key: ${keyStr}`);
            }
            else {
                // Update existing entity
                rows[existingIndex] = entity;
                updated.push(entity);
                forStoreUpdates.push({ index: existingIndex, row: entity });
                logger.info(`[Repository] updated entity with key: ${keyStr}`);
            }
        }
        // Persist changes to store
        if (forStoreAdds.length > 0)
            deps.store.saveAdded(forStoreAdds);
        if (forStoreUpdates.length > 0)
            deps.store.saveUpdated(forStoreUpdates);
        return { added, updated };
    }
    /**
     * Delete entities by keys
     */
    function deleteMany(keys) {
        ensureLoaded();
        const keyList = Array.isArray(keys) ? keys : [keys];
        const indicesToDelete = [];
        // Find all entities to delete
        for (const key of keyList) {
            const keyStr = keyToString(key);
            const index = idx.get(keyStr);
            if (index != null) {
                indicesToDelete.push(index);
                logger.info(`[Repository] deleted entity with key: ${keyStr}`);
            }
        }
        if (indicesToDelete.length === 0)
            return { deleted: 0 };
        // Sort indexes for consistent deletion
        indicesToDelete.sort((a, b) => a - b);
        // Mark rows to keep
        const keepRow = new Array(rows.length).fill(true);
        for (const index of indicesToDelete) {
            keepRow[index] = false;
        }
        // Compact rows array
        const newRows = [];
        for (let i = 0; i < rows.length; i++) {
            if (keepRow[i])
                newRows.push(rows[i]);
        }
        rows = newRows;
        buildIndex();
        deps.store.deleteByIndexes(indicesToDelete);
        return { deleted: indicesToDelete.length };
    }
    /**
     * Ensure data is loaded before operations
     */
    function ensureLoaded() {
        if (rows.length === 0 && idx.size === 0)
            load();
    }
    /**
     * Validate that all key parts are present
     */
    function validateKey(key) {
        for (const param of deps.schema.keyParameters) {
            const value = key[param];
            if (value == null || value === '') {
                throw new RepositoryError('InvalidKey', `key part "${String(param)}" is missing`);
            }
        }
    }
    const result = {
        load,
        find,
        findAll,
        upsert,
        delete: deleteMany,
        get entities() {
            ensureLoaded();
            return rows;
        }
    };
    return result;
}
__webpack_require__.g.create = __webpack_exports__.create;
;// ./modules/repository/Codec.ts
/**
 * Repository Codec Utilities - Key encoding and decoding
 */
/**
 * Creates a simple key codec with configurable delimiter
 * @param keyFields Array of key field names (optional, inferred from first stringify call if not provided)
 * @param delim Delimiter character (default: '|')
 * @returns KeyCodec instance for stringify/parse operations
 *
 * Example:
 * ```typescript
 * const codec = simple<User, 'id' | 'org'>(['id', 'org'], '|');
 * const key = { id: 'user123', org: 'acme' };
 * const str = codec.stringify(key); // 'user123|acme'
 * const parsed = codec.parse(str); // { id: 'user123', org: 'acme' }
 * ```
 */
function simple(keyFields, delim = '|') {
    /**
     * Escape special characters (backslash and delimiter)
     */
    const delimRegex = new RegExp(`[${delim}]`, 'g');
    const escape = (s) => s.replace(/\\/g, '\\\\').replace(delimRegex, (match) => '\\' + match);
    // Store key field names from parameter or first stringify call
    let storedKeyFields = keyFields || null;
    return {
        /**
         * Convert key object to delimited string
         */
        stringify(key) {
            const parts = [];
            const keys = Object.keys(key);
            // Store key fields on first call for use in parse (if not already provided)
            if (storedKeyFields === null) {
                storedKeyFields = keys;
            }
            for (const k of keys) {
                const value = key[k];
                const stringValue = value == null ? '' : String(value);
                parts.push(escape(stringValue));
            }
            return parts.join(delim);
        },
        /**
         * Parse delimited string back to key object
         */
        parse(s) {
            const parts = [];
            let current = '';
            for (let i = 0; i < s.length; i++) {
                const char = s[i];
                // Handle escape sequences
                if (char === '\\' && i + 1 < s.length) {
                    current += s[i + 1];
                    i++;
                }
                else if (char === delim) {
                    // Delimiter: push current part and start new one
                    parts.push(current);
                    current = '';
                }
                else {
                    current += char;
                }
            }
            parts.push(current);
            // Map array back to object using stored key fields
            const result = {};
            if (storedKeyFields) {
                for (let i = 0; i < storedKeyFields.length && i < parts.length; i++) {
                    result[storedKeyFields[i]] = parts[i];
                }
            }
            return result;
        }
    };
}
__webpack_require__.g.simple = __webpack_exports__.simple;
;// ./modules/repository/SchemaFactory.ts
/**
 * Repository Schema Factory
 * - Generates parameters and fromPartial from entity type
 */
/**
 * Generate parameters (field names) from an entity instance or prototype.
 * @param sample A sample entity (instance or prototype)
 * @returns string[]
 */
function getParametersFromEntity(sample) {
    return Object.keys(sample);
}
/**
 * Create a fromPartial function for an entity type.
 * @param sample A sample entity (for default values)
 * @returns (partial: Partial<TEntity>) => TEntity
 */
function createFromPartial(sample) {
    return (partial) => {
        const result = { ...sample };
        // Merge partial properties into result
        for (const key of Object.keys(partial)) {
            if (partial[key] !== undefined) {
                result[key] = partial[key];
            }
        }
        return result;
    };
}
/**
 * Create a Schema from a sample entity and keyParameters
 * @param entityFactory A factory function to create new instances of the entity
 * @param keyParameters Keys used for primary key
 * @returns Repository.Ports.Schema<TEntity, Key>
 */
function createSchema(entityFactory, keyParameters) {
    const sample = entityFactory();
    return {
        parameters: getParametersFromEntity(sample),
        keyParameters,
        fromPartial: createFromPartial(sample),
        instantiate: entityFactory
    };
}
__webpack_require__.g.getParametersFromEntity = __webpack_exports__.getParametersFromEntity;
__webpack_require__.g.createFromPartial = __webpack_exports__.createFromPartial;
__webpack_require__.g.createSchema = __webpack_exports__.createSchema;
;// ./modules/repository/MemoryAdapter.ts
/**
 * Repository Module - Memory Adapter
 * In-memory storage adapter for Repository
 * Useful for testing and temporary data storage
 */
/**
 * In-memory implementation of Repository.Ports.Store
 * Stores entities in a simple array with index-based access
 */
class MemoryStore {
    constructor() {
        this.arr = [];
    }
    /**
     * Load all entities from memory
     */
    load() {
        return { rows: this.arr.slice() };
    }
    /**
     * Append new entities to the end of the array
     */
    saveAdded(rows) {
        this.arr.push(...rows);
    }
    /**
     * Update entities at specific indexes
     */
    saveUpdated(rows) {
        for (const r of rows) {
            this.arr[r.index] = r.row;
        }
    }
    /**
     * Delete entities by marking and compacting the array
     */
    deleteByIndexes(indexes) {
        const keepRow = new Array(this.arr.length).fill(true);
        // Mark rows to delete
        for (const idx of indexes) {
            keepRow[idx] = false;
        }
        // Compact array by keeping only marked rows
        const newArr = [];
        for (let i = 0; i < this.arr.length; i++) {
            if (keepRow[i])
                newArr.push(this.arr[i]);
        }
        this.arr = newArr;
    }
}

;// ./modules/repository/SpreadsheetAdapter.ts
/**
 * Repository Module - Google Spreadsheet Adapter
 */

class SpreadsheetStore {
    constructor(sheetId, sheetName, schema, options = {}) {
        this.sheetId = sheetId;
        this.sheetName = sheetName;
        this.schema = schema;
        this.options = options;
    }
    getSheet_() {
        const ss = SpreadsheetApp.openById(this.sheetId);
        const sh = ss.getSheetByName(this.sheetName);
        if (!sh)
            throw new RepositoryError('StoreError', `Sheet not found: ${this.sheetName}`);
        return sh;
    }
    load() {
        var _a;
        const sh = this.getSheet_();
        const values = sh.getDataRange().getValues();
        const headerRow = Math.max(1, (_a = this.options.headerRow) !== null && _a !== void 0 ? _a : 1) - 1;
        if (values.length <= headerRow)
            return { rows: [] };
        const header = values[headerRow].map(String);
        const nameToIdx = new Map();
        for (let i = 0; i < header.length; i++) {
            const h = header[i];
            if (nameToIdx.has(h))
                throw new RepositoryError('HeaderDuplicate', `duplicate header: ${h}`);
            nameToIdx.set(h, i);
        }
        for (const p of this.schema.parameters) {
            const h = String(p);
            if (!nameToIdx.has(h))
                throw new RepositoryError('HeaderMissing', `missing header: ${h}`);
        }
        const rows = [];
        for (let r = headerRow + 1; r < values.length; r++) {
            const raw = {};
            for (const p of this.schema.parameters) {
                const c = nameToIdx.get(String(p));
                raw[String(p)] = values[r][c];
            }
            const rec = this.schema.onAfterLoad ? this.schema.onAfterLoad(raw) : raw;
            rows.push(this.schema.fromPartial(rec));
        }
        return { rows };
    }
    saveAdded(rows) {
        var _a;
        if (!rows.length)
            return;
        const sh = this.getSheet_();
        const headerRow = Math.max(1, (_a = this.options.headerRow) !== null && _a !== void 0 ? _a : 1) - 1;
        const header = sh
            .getRange(headerRow + 1, 1, 1, sh.getLastColumn())
            .getValues()[0]
            .map(String);
        const nameToIdx = new Map();
        for (let i = 0; i < header.length; i++)
            nameToIdx.set(header[i], i);
        const data = [];
        for (const e of rows) {
            const row = new Array(header.length).fill('');
            for (const p of this.schema.parameters) {
                const c = nameToIdx.get(String(p));
                let v = e[String(p)];
                if (v == null && this.options.nullAsEmpty)
                    v = '';
                if (this.options.textPrefixApostrophe &&
                    typeof v === 'string' &&
                    v.length &&
                    v[0] == '=')
                    v = "'" + v;
                row[c] = v;
            }
            data.push(row);
        }
        const startR = sh.getLastRow() + 1;
        sh.getRange(startR, 1, data.length, data[0].length).setValues(data);
    }
    saveUpdated(rows) {
        var _a;
        if (!rows.length)
            return;
        const sh = this.getSheet_();
        const headerRow = Math.max(1, (_a = this.options.headerRow) !== null && _a !== void 0 ? _a : 1) - 1;
        const header = sh
            .getRange(headerRow + 1, 1, 1, sh.getLastColumn())
            .getValues()[0]
            .map(String);
        const nameToIdx = new Map();
        for (let i = 0; i < header.length; i++)
            nameToIdx.set(header[i], i);
        // 連続ブロックごとにまとめて setValues
        rows.sort((a, b) => a.index - b.index);
        let block = null;
        const flush = () => {
            if (!block)
                return;
            const r = headerRow + 2 + block.r0; // data starts at +2 (1-based next row after header)
            const h = sh.getRange(r, 1, block.rows.length, header.length);
            h.setValues(block.rows);
            block = null;
        };
        for (const it of rows) {
            const rowArr = new Array(header.length).fill('');
            for (const p of this.schema.parameters) {
                const c = nameToIdx.get(String(p));
                let v = it.row[String(p)];
                if (v == null && this.options.nullAsEmpty)
                    v = '';
                if (this.options.textPrefixApostrophe &&
                    typeof v === 'string' &&
                    v.length &&
                    v[0] == '=')
                    v = "'" + v;
                rowArr[c] = v;
            }
            if (!block)
                block = { r0: it.index, rows: [rowArr] };
            else if (block.r0 + block.rows.length === it.index)
                block.rows.push(rowArr);
            else {
                flush();
                block = { r0: it.index, rows: [rowArr] };
            }
        }
        flush();
    }
    deleteByIndexes(indexes) {
        var _a, _b, _c;
        if (!indexes.length)
            return;
        const sh = this.getSheet_();
        const headerRow = Math.max(1, (_a = this.options.headerRow) !== null && _a !== void 0 ? _a : 1) - 1;
        indexes.sort((a, b) => b - a); // delete from bottom
        if ((_b = this.options.softDelete) === null || _b === void 0 ? void 0 : _b.enabled) {
            const flag = this.options.softDelete.flagField;
            const trueVal = (_c = this.options.softDelete.trueValue) !== null && _c !== void 0 ? _c : true;
            const header = sh
                .getRange(headerRow + 1, 1, 1, sh.getLastColumn())
                .getValues()[0]
                .map(String);
            const nameToIdx = new Map();
            for (let i = 0; i < header.length; i++)
                nameToIdx.set(header[i], i);
            const col = nameToIdx.get(flag);
            if (col == null)
                throw new RepositoryError('HeaderMissing', `missing softDelete flag column: ${flag}`);
            for (const idx of indexes) {
                const r = headerRow + 2 + idx;
                sh.getRange(r, col + 1).setValue(trueVal);
            }
        }
        else {
            for (const idx of indexes) {
                const r = headerRow + 2 + idx;
                sh.deleteRow(r);
            }
        }
    }
}

;// ./modules/repository/index.ts
/**
 * Repository Module - Entry Point
 */







__webpack_require__.g.MemoryStore = __webpack_exports__.MemoryStore;
__webpack_require__.g.SpreadsheetStore = __webpack_exports__.SpreadsheetStore;
__webpack_require__.g.RepositoryError = __webpack_exports__.RepositoryError;
;// ./modules/routing/Types.ts
/**
 * Routing Module - Type Definitions
 */


;// ./modules/routing/Engine.ts
/**
 * Routing Module - Engine Implementation
 */
function parsePath(path) {
    if (!path.startsWith('/'))
        path = '/' + path;
    const tokens = path.split('/').filter((x) => x.length > 0);
    const segs = [];
    for (const t of tokens) {
        if (t === '*')
            segs.push({ kind: 'wildcard' });
        else if (t.startsWith(':'))
            segs.push({ kind: 'param', name: t.slice(1) });
        else
            segs.push({ kind: 'static', value: t });
    }
    return segs;
}
function matchSegments(segs, parts) {
    const params = {};
    let segmentIndex = 0;
    for (; segmentIndex < segs.length; segmentIndex++) {
        const segment = segs[segmentIndex];
        const part = parts[segmentIndex];
        // Wildcard can match zero or more parts
        if (segment.kind === 'wildcard') {
            params['*'] = decodeURIComponent(parts.slice(segmentIndex).join('/'));
            return { ok: true, params };
        }
        // All other segments require a matching part
        if (!part)
            return { ok: false };
        if (segment.kind === 'static') {
            if (part !== segment.value)
                return { ok: false };
        }
        else if (segment.kind === 'param') {
            params[segment.name] = decodeURIComponent(part);
        }
    }
    // All segments matched; ensure no extra parts remain
    if (segmentIndex !== parts.length)
        return { ok: false };
    return { ok: true, params };
}
/**
 * Calculate route specificity for prioritization
 * Higher score = more specific route (should be matched first)
 */
function calculateSpecificity(segments) {
    let score = 0;
    for (const seg of segments) {
        if (seg.kind === 'static')
            score += 3;
        else if (seg.kind === 'param')
            score += 2;
        else
            score += 1; // wildcard
    }
    return score;
}
/**
 * Compose middleware chain with handler
 */
function composeMiddleware(middlewares, handler) {
    return middlewares.reduceRight((next, mw) => (ctx) => mw(ctx, () => next(ctx)), handler);
}
function routing_Engine_create(logger) {
    const middlewares = [];
    const routes = [];
    const log = logger !== null && logger !== void 0 ? logger : { info: (_) => { }, error: (_) => { } };
    function use(mw) {
        middlewares.push(mw);
        return api;
    }
    function register(path, handler) {
        const segments = parsePath(path);
        routes.push({ path, segments, handler });
        // Sort by specificity (most specific first)
        routes.sort((a, b) => calculateSpecificity(b.segments) - calculateSpecificity(a.segments));
        log.info(`[Router] registered route: ${path}`);
        return api;
    }
    function registerAll(map) {
        for (const [path, handler] of Object.entries(map)) {
            register(path, handler);
        }
        return api;
    }
    function mount(prefix, sub) {
        // Resolve sub routes by wrapping dispatch
        return register(prefix + '/*', (ctx) => sub.dispatch('/' + ctx.params['*'], ctx));
    }
    function resolve(path) {
        const parts = path.split('/').filter((x) => x.length > 0);
        for (const route of routes) {
            const match = matchSegments(route.segments, parts);
            if (match.ok) {
                const params = match.params || {};
                // Return the original handler, not the wrapped one, so tests can compare handlers
                return { handler: route.handler, params };
            }
        }
        return null;
    }
    function dispatch(path, ctx) {
        const resolved = resolve(path);
        if (!resolved)
            throw new Error(`No route found for path: ${path}`);
        // Compose middlewares with the resolved handler
        const composedHandler = composeMiddleware(middlewares, resolved.handler);
        // Merge params into context
        const contextWithParams = {
            ...ctx,
            params: { ...ctx.params, ...resolved.params }
        };
        log.info(`[Router] dispatching to route: ${path}`);
        return composedHandler(contextWithParams);
    }
    const api = {
        use,
        register,
        registerAll,
        mount,
        resolve,
        dispatch
    };
    return api;
}
__webpack_require__.g.create = __webpack_exports__.create;
;// ./modules/routing/index.ts
/**
 * Routing Module - Entry Point
 */



;// ./modules/string-helper/index.ts
/**
 * StringHelper - String templating and formatting utilities
 */
/**
 * Format string with indexed placeholders {0}, {1}, etc.
 * @param formatText Template string with {n} placeholders
 * @param args Values to substitute into placeholders
 * @returns Formatted string
 */
function formatString(formatText, ...args) {
    // Performance optimization: use single replace with callback instead of multiple RegExp instances
    return String(formatText).replace(/\{(\d+)\}/g, (match, index) => {
        const i = parseInt(index, 10);
        return i < args.length ? String(args[i]) : match;
    });
}
function formatDate(date, format, tz) {
    // Use Utilities + Session in GAS environment. Fallback to lightweight formatter in other environments.
    try {
        if (typeof Utilities !== 'undefined' &&
            typeof Session !== 'undefined' &&
            Session.getScriptTimeZone) {
            const zone = typeof tz === 'string' && tz.trim() ? tz : Session.getScriptTimeZone();
            return Utilities.formatDate(date, zone, format);
        }
    }
    catch { }
    // Fallback: limited tokens yyyy MM dd HH mm ss
    const pad = (n, w = 2) => String(n).padStart(w, '0');
    const y = date.getUTCFullYear();
    const M = pad(date.getUTCMonth() + 1);
    const d = pad(date.getUTCDate());
    const H = pad(date.getUTCHours());
    const m = pad(date.getUTCMinutes());
    const s = pad(date.getUTCSeconds());
    return format
        .replace(/yyyy/g, String(y))
        .replace(/MM/g, M)
        .replace(/dd/g, d)
        .replace(/HH/g, H)
        .replace(/mm/g, m)
        .replace(/ss/g, s);
}
function resolveString(str, context) {
    const placeholderPattern = /{{(.*?)}}/g;
    return String(str).replace(placeholderPattern, (_match, p1) => {
        const expr = String(p1).trim();
        if (!expr || expr === '')
            return ''; // Return empty string for empty expressions
        const v = resolveExpression(expr, context);
        return v == null ? '' : String(v);
    });
}
function get(obj, path, defaultValue) {
    if (!path || path === '')
        return obj; // Return the object itself for empty path
    const v = resolveExpression(path, obj);
    return v == null ? defaultValue : v;
}
function resolveExpression(expr, root) {
    if (!expr || expr.trim() === '')
        return ''; // Return empty string for empty expressions
    // Supports: a.b, a[0], func(x, 'y'), and wildcard-free simple expressions chained by dots
    const tokens = splitTopLevel(expr, '.');
    let current = root;
    for (const token of tokens) {
        if (current == null)
            break;
        if (token.endsWith(')')) {
            // Function call: extract function name and arguments
            const parenIndex = token.indexOf('(');
            const fnName = token.slice(0, parenIndex);
            const argStr = token.slice(parenIndex + 1, -1);
            const fn = resolveSimple(current, fnName);
            if (typeof fn !== 'function')
                return null;
            const args = parseArgs(argStr, root, current);
            current = fn.apply(current, args);
        }
        else {
            // Simple property or array access
            current = resolveSimple(current, token);
        }
    }
    return current;
}
function resolveSimple(base, token) {
    // token examples: user, user[0], name
    const m = token.match(/^(.*?)\[(\d+)\]$/);
    if (m) {
        const head = m[1];
        const idx = Number(m[2]);
        const obj = head ? (base ? base[head] : undefined) : base;
        return obj ? obj[idx] : undefined;
    }
    return base ? base[token] : undefined;
}
function splitTopLevel(input, sep) {
    const out = [];
    let currentToken = '';
    let parenDepth = 0;
    let inSingleQuote = false;
    let inDoubleQuote = false;
    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        // Handle escape sequences
        if (char === '\\' && i + 1 < input.length) {
            currentToken += char + input[++i];
            continue;
        }
        // Track quote state
        if (char === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote;
            currentToken += char;
            continue;
        }
        if (char === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote;
            currentToken += char;
            continue;
        }
        // Track parenthesis depth and handle separator when not in quotes
        if (!inSingleQuote && !inDoubleQuote) {
            if (char === '(')
                parenDepth++;
            else if (char === ')')
                parenDepth--;
            if (parenDepth === 0 && char === sep) {
                out.push(currentToken);
                currentToken = '';
                continue;
            }
        }
        currentToken += char;
    }
    if (currentToken.length)
        out.push(currentToken);
    return out
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
}
function parseArgs(argsStr, root, thisObj) {
    const parts = splitTopLevel(argsStr, ',');
    return parts.map((p) => parseArg(p, root, thisObj));
}
function parseArg(src, root, thisObj) {
    const s = src.trim();
    if (!s)
        return undefined;
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
        try {
            return JSON.parse(s.replace(/'/g, '"'));
        }
        catch {
            return s.slice(1, -1);
        }
    }
    if (/^\d+(\.\d+)?$/.test(s))
        return Number(s);
    if (s === 'true')
        return true;
    if (s === 'false')
        return false;
    if (s === 'null')
        return null;
    if (s === 'undefined')
        return undefined;
    // path lookup: prefer thisObj then root
    const fromThis = resolveExpression(s, thisObj);
    if (fromThis != null)
        return fromThis;
    return resolveExpression(s, root);
}
__webpack_require__.g.formatString = __webpack_exports__.formatString;
__webpack_require__.g.formatDate = __webpack_exports__.formatDate;
__webpack_require__.g.resolveString = __webpack_exports__.resolveString;
__webpack_require__.g.get = __webpack_exports__.get;
;// ./modules/rest-framework/Types.ts
/**
 * RestFramework Module - Type Definitions
 */


;// ./modules/rest-framework/Logger.ts
/**
 * RestFramework - Logger Implementation
 */
/**
 * Basic logger implementation for API RestFramework
 * Adapts to existing shared Logger interface
 */
class Logger_Logger {
    constructor(prefix = '[API]') {
        this.prefix = prefix;
    }
    info(msg) {
        console.log(`${this.prefix} ${new Date().toISOString()} INFO: ${msg}`);
    }
    error(msg, err) {
        const errorMsg = err ? ` | Error: ${err}` : '';
        console.error(`${this.prefix} ${new Date().toISOString()} ERROR: ${msg}${errorMsg}`);
    }
    /**
     * Creates a logger with custom prefix
     */
    static create(prefix = '[API]') {
        return new Logger_Logger(prefix);
    }
}

;// ./modules/rest-framework/ApiResponseFormatter.ts
/**
 * RestFramework - API Response Formatter
 */
/**
 * Standard API response formatter
 * Provides consistent response structure across all API endpoints
 */
class ApiResponseFormatter {
    /**
     * Creates a successful response
     */
    static success(data) {
        return {
            success: true,
            data,
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Creates an error response
     */
    static error(code, message, details) {
        return {
            success: false,
            error: {
                code,
                message,
                details
            },
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Creates a response from raw data, handling errors automatically
     */
    static from(dataOrError, errorCode = 'InternalError') {
        if (dataOrError instanceof Error) {
            return this.error(errorCode, dataOrError.message, dataOrError);
        }
        return this.success(dataOrError);
    }
}

;// ./modules/rest-framework/ErrorHandler.ts
/**
 * RestFramework - Error Handler
 */


/**
 * Centralized error handling for API RestFramework
 * Provides comprehensive error logging, monitoring, and standardized error responses
 */
class ErrorHandler {
    constructor(logger = new Logger_Logger('[ErrorHandler]')) {
        this.logger = logger;
        this.errorCount = new Map();
    }
    /**
     * Handles errors and converts them to API responses
     * Logs comprehensive error information for monitoring and debugging
     */
    handle(error, context) {
        // Log error with full context
        this.logError(error, context);
        // Track error frequency for monitoring
        this.trackErrorFrequency(error);
        // Handle known error types
        if (error instanceof Error) {
            return this.handleKnownError(error);
        }
        // Handle unknown errors
        return ApiResponseFormatter.error('InternalError', 'An unexpected error occurred', error);
    }
    /**
     * Handles known Error instances
     */
    handleKnownError(error) {
        // Map common error patterns to error codes
        const errorCode = this.mapErrorToCode(error);
        return ApiResponseFormatter.error(errorCode, error.message, error);
    }
    /**
     * Maps error types/messages to framework error codes
     */
    mapErrorToCode(error) {
        const message = error.message.toLowerCase();
        if (message.includes('validation') || message.includes('invalid')) {
            return 'ValidationError';
        }
        if (message.includes('unauthorized') || message.includes('authentication')) {
            return 'AuthenticationError';
        }
        if (message.includes('forbidden') || message.includes('authorization')) {
            return 'AuthorizationError';
        }
        if (message.includes('not found')) {
            return 'NotFound';
        }
        if (message.includes('method not allowed')) {
            return 'MethodNotAllowed';
        }
        if (message.includes('bad request')) {
            return 'BadRequest';
        }
        return 'InternalError';
    }
    /**
     * Logs comprehensive error information for monitoring and debugging
     */
    logError(error, context) {
        const errorCode = error instanceof Error ? this.mapErrorToCode(error) : 'InternalError';
        const timestamp = (context === null || context === void 0 ? void 0 : context.timestamp) || new Date().toISOString();
        const errorInfo = {
            code: errorCode,
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: timestamp,
            stack: error instanceof Error ? error.stack : undefined,
            request: (context === null || context === void 0 ? void 0 : context.request) ? this.sanitizeRequest(context.request) : undefined
        };
        this.logger.error(`Error occurred: ${errorCode}`, errorInfo);
        // Log to console for GAS execution transcript visibility
        console.error(`[${timestamp}] ErrorHandler: ${errorCode} - ${errorInfo.message}`);
        if (error instanceof Error && error.stack) {
            console.error(`Stack trace: ${error.stack}`);
        }
    }
    /**
     * Sanitizes request data for logging (removes sensitive information)
     */
    sanitizeRequest(request) {
        if (!request)
            return undefined;
        const sanitized = {
            method: request.method,
            path: request.path
        };
        // Remove sensitive headers like authorization tokens
        if (request.headers) {
            sanitized.headers = { ...request.headers };
            if (sanitized.headers.authorization) {
                sanitized.headers.authorization = '[REDACTED]';
            }
            if (sanitized.headers.token) {
                sanitized.headers.token = '[REDACTED]';
            }
        }
        return sanitized;
    }
    /**
     * Tracks error frequency for monitoring high-frequency errors
     * This helps identify recurring issues that need attention
     */
    trackErrorFrequency(error) {
        const errorKey = error instanceof Error
            ? `${this.mapErrorToCode(error)}:${error.message}`
            : 'UnknownError';
        const currentCount = this.errorCount.get(errorKey) || 0;
        const newCount = currentCount + 1;
        this.errorCount.set(errorKey, newCount);
        // Log warning for high-frequency errors (threshold: 5 occurrences)
        if (newCount === 5) {
            this.logger.error(`High-frequency error detected: ${errorKey} (${newCount} occurrences)`, { errorKey, count: newCount });
            console.warn(`[MONITORING] High-frequency error: ${errorKey} occurred ${newCount} times`);
        }
        else if (newCount > 5 && newCount % 10 === 0) {
            // Log every 10th occurrence after threshold
            this.logger.error(`Continuing high-frequency error: ${errorKey} (${newCount} occurrences)`, { errorKey, count: newCount });
        }
    }
    /**
     * Gets error statistics for monitoring
     * Useful for understanding error patterns in production
     */
    getErrorStatistics() {
        const stats = [];
        this.errorCount.forEach((count, errorKey) => {
            stats.push({ errorKey, count });
        });
        return stats.sort((a, b) => b.count - a.count); // Sort by frequency descending
    }
    /**
     * Resets error statistics
     * Useful for clearing counters after a deployment or time period
     */
    resetErrorStatistics() {
        this.errorCount.clear();
        this.logger.info('Error statistics reset');
    }
    /**
     * Creates an ErrorHandler with optional logger
     */
    static create(logger) {
        return new ErrorHandler(logger);
    }
}

;// ./modules/rest-framework/ApiController.ts
/**
 * RestFramework - API Controller Base Class
 */



/**
 * Abstract base controller for API endpoints
 * Provides standardized request/response handling with dependency injection support
 */
class ApiController {
    constructor(_requestMapper, _responseMapper, _apiLogic, _requestValidator, _authService, _middlewareManager, _logger, _errorHandler) {
        this._requestMapper = _requestMapper;
        this._responseMapper = _responseMapper;
        this._apiLogic = _apiLogic;
        this._requestValidator = _requestValidator;
        this._authService = _authService;
        this._middlewareManager = _middlewareManager;
        this._logger = _logger || Logger_Logger.create('[BaseApiController]');
        this._errorHandler = _errorHandler || ErrorHandler.create(this._logger);
    }
    /**
     * Main entry point for handling requests
     * Follows the complete request/response pipeline
     */
    handle(rawRequest) {
        const timestamp = new Date().toISOString();
        try {
            this._logger.info(`Handling request: ${JSON.stringify(rawRequest)}`);
            // Execute middleware if available
            if (this._middlewareManager) {
                return this._middlewareManager.execute(rawRequest, () => this.processRequest(rawRequest));
            }
            return this.processRequest(rawRequest);
        }
        catch (error) {
            // Pass request context to error handler for better logging
            return this._errorHandler.handle(error, {
                request: rawRequest,
                timestamp: timestamp
            });
        }
    }
    /**
     * Core request processing pipeline
     */
    processRequest(rawRequest) {
        // 1. Map raw request to typed request
        const typedRequest = this._requestMapper.map(rawRequest);
        // 2. Validate request if validator is available
        if (this._requestValidator) {
            const validation = this._requestValidator.validate(typedRequest);
            if (!validation.isValid) {
                return ApiResponseFormatter.error('ValidationError', 'Request validation failed', { errors: validation.errors });
            }
        }
        // 3. Authenticate if auth service is available
        if (this._authService) {
            const auth = this._authService.authenticate(rawRequest.token);
            if (!auth.isAuthenticated) {
                return ApiResponseFormatter.error('AuthenticationError', 'Authentication required');
            }
            // Store user context for business logic if needed
            typedRequest.__user = auth.user;
        }
        // 4. Execute business logic
        const logicResult = this._apiLogic.execute(typedRequest);
        // 5. Handle async logic
        if (logicResult instanceof Promise) {
            throw new Error('Async logic not supported in GAS environment. Use synchronous execution.');
        }
        // 6. Map response
        const mappedResponse = this._responseMapper.map(logicResult);
        // 7. Return formatted success response
        return ApiResponseFormatter.success(mappedResponse);
    }
    /**
     * Template method for handling specific HTTP methods
     * Override in concrete controllers for method-specific logic
     */
    handleMethod(method, _request) {
        throw new Error(`Method ${method} not supported`);
    }
}

;// ./modules/rest-framework/RouteExecutor.ts
/**
 * RestFramework - Route Executor
 */



/**
 * Validates a DI token before resolution
 * @param token The token to validate
 * @param componentName Descriptive name of the component being resolved
 * @throws Error if token is invalid
 */
function validateToken(token, componentName) {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
        throw new Error(`Invalid DI token for ${componentName}: token must be a non-empty string`);
    }
}
/**
 * Safely resolves a dependency from the container with validation and error handling
 * @param container The DI container
 * @param token The DI token to resolve
 * @param componentName Descriptive name of the component being resolved
 * @param logger The logger instance
 * @returns The resolved dependency
 * @throws Error if resolution fails
 */
function safeResolve(container, token, componentName, logger) {
    try {
        validateToken(token, componentName);
        logger.info(`Resolving ${componentName} with token: ${token}`);
        return container.resolve(token);
    }
    catch (error) {
        logger.error(`Failed to resolve ${componentName} with token: ${token}`, error);
        throw new Error(`Dependency resolution failed for ${componentName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Logging helper utility to consolidate repeated logging logic
 * @param logger The logger instance
 * @param stage The execution stage name
 * @param action Either 'start' or 'end'
 */
function logExecutionStage(logger, stage, action) {
    const prefix = action === 'start' ? 'Start' : 'Finished';
    logger.info(`${prefix} ${stage}`);
}
/**
 * Generic executor that runs the API pipeline without Controller dependency
 * Resolves all components (API, requestMapper, responseMapper, errorHandler, logger) via DI
 * Executes the pipeline: map → execute → success/error
 *
 * IMPORTANT GAS COMPATIBILITY NOTES:
 * - Google Apps Script does not support native Promises in synchronous execution contexts
 * - All API logic must be synchronous to ensure compatibility
 * - Token lifecycles are managed per-request using scoped containers
 * - Always dispose scoped containers to prevent resource leaks
 *
 * @param route The route definition (token-based)
 * @param normalizedRequest The normalized request context
 * @param rootContainer The root DI container
 * @returns The mapped response or error response
 */
function executeRoute(route, normalizedRequest, rootContainer) {
    // Create a scoped container for this route
    const scopedContainer = rootContainer.createScope(route.endPoint);
    try {
        return Context.run(scopedContainer, () => {
            // Initialize or resolve logger
            const logger = route.loggerToken
                ? safeResolve(scopedContainer, route.loggerToken, 'Logger', new Logger_Logger(`[RouteExecutor:${route.endPoint}]`) // temporary logger for resolution logging
                )
                : new Logger_Logger(`[RouteExecutor:${route.endPoint}]`);
            // Initialize or resolve ErrorHandler component for centralized error handling
            const errorHandler = route.errorHandlerToken
                ? safeResolve(scopedContainer, route.errorHandlerToken, 'ErrorHandler', logger)
                : new ErrorHandler(logger);
            try {
                // Resolve all components via DI tokens with validation
                const api = safeResolve(scopedContainer, route.apiToken, 'ApiLogic', logger);
                const requestMapper = safeResolve(scopedContainer, route.requestMapperToken, 'RequestMapper', logger);
                const responseMapper = safeResolve(scopedContainer, route.responseMapperToken, 'ResponseMapper', logger);
                // Execute request mapping
                logExecutionStage(logger, 'RequestMapper.map', 'start');
                const mappedRequest = requestMapper.map(normalizedRequest);
                logExecutionStage(logger, 'RequestMapper.map', 'end');
                logger.info(`Request: ${JSON.stringify(mappedRequest)}`);
                // Execute API logic
                logExecutionStage(logger, 'Api.execute', 'start');
                const response = api.execute(mappedRequest);
                logExecutionStage(logger, 'Api.execute', 'end');
                logger.info(`Response: ${JSON.stringify(response)}`);
                // Map response
                logExecutionStage(logger, 'ResponseMapper.map', 'start');
                const mappedResponse = responseMapper.map(response);
                logExecutionStage(logger, 'ResponseMapper.map', 'end');
                return mappedResponse;
            }
            catch (error) {
                // Centralized error handling with ErrorHandler
                logger.error('Error during route execution', error);
                return errorHandler.handle(error, {
                    request: normalizedRequest,
                    timestamp: new Date().toISOString()
                });
            }
        });
    }
    finally {
        // Cleanup scoped container to avoid resource leaks
        // Must be called outside Context.run to ensure proper cleanup
        scopedContainer.dispose();
    }
}
__webpack_require__.g.executeRoute = __webpack_exports__.executeRoute;
;// ./modules/rest-framework/NormalizedRequest.ts
/**
 * RestFramework - Normalized Request Utilities
 */
function coerceParamValue(v) {
    if (typeof v !== 'string')
        return v;
    const s = v.trim();
    if (s === '')
        return v;
    // boolean
    if (s === 'true')
        return true;
    if (s === 'false')
        return false;
    // number (integer/float)
    if (/^-?\d+(\.\d+)?$/.test(s)) {
        const n = Number(s);
        if (!Number.isNaN(n))
            return n;
    }
    return v;
}
function tryCoerceNumber(v) {
    if (typeof v === 'number' && !Number.isNaN(v))
        return v;
    if (typeof v === 'string') {
        const s = v.trim();
        if (s !== '' && /^-?\d+(\.\d+)?$/.test(s)) {
            const n = Number(s);
            if (!Number.isNaN(n))
                return n;
        }
    }
    return undefined;
}
function normalizeDoGet(e) {
    var _a;
    // parameter only
    const params = {};
    const p = (_a = e.parameter) !== null && _a !== void 0 ? _a : {};
    for (const k of Object.keys(p))
        params[k] = coerceParamValue(p[k]);
    return params;
}
function normalizeDoPost(e) {
    var _a, _b;
    // parameter (coerce)
    const params = {};
    const p = (_a = e.parameter) !== null && _a !== void 0 ? _a : {};
    for (const k of Object.keys(p))
        params[k] = coerceParamValue(p[k]);
    // body (raw JSON)
    let body = {};
    const contents = (_b = e.postData) === null || _b === void 0 ? void 0 : _b.contents;
    if (contents) {
        try {
            const parsed = JSON.parse(contents);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                body = parsed;
            }
        }
        catch {
            // ignore invalid JSON
        }
    }
    return { ...params, ...body };
}
__webpack_require__.g.coerceParamValue = __webpack_exports__.coerceParamValue;
__webpack_require__.g.tryCoerceNumber = __webpack_exports__.tryCoerceNumber;
__webpack_require__.g.normalizeDoGet = __webpack_exports__.normalizeDoGet;
__webpack_require__.g.normalizeDoPost = __webpack_exports__.normalizeDoPost;
;// ./modules/rest-framework/RequestMappers.ts
/**
 * RestFramework Module - Request Mappers
 */
/**
 * Base class for RequestMappers that use NormalizedRequest
 * Provides helper methods to access values with proper typing and defaults
 */
class NormalizedRequestMapper {
    /**
     * Get a string value from normalized request
     * @param key The key to retrieve
     * @param defaultValue Optional default if key is missing or empty
     */
    getString(key, defaultValue) {
        var _a;
        const v = (_a = this.request) === null || _a === void 0 ? void 0 : _a[key];
        if (v === undefined || v === null || v === '') {
            return defaultValue;
        }
        return String(v);
    }
    /**
     * Get a number value from normalized request
     * @param key The key to retrieve
     * @param defaultValue Optional default if key is missing or not a valid number
     */
    getNumber(key, defaultValue) {
        var _a;
        const v = (_a = this.request) === null || _a === void 0 ? void 0 : _a[key];
        if (v === undefined || v === null) {
            return defaultValue;
        }
        if (typeof v === 'number' && !Number.isNaN(v)) {
            return v;
        }
        const n = Number(v);
        return Number.isNaN(n) ? defaultValue : n;
    }
    /**
     * Get a boolean value from normalized request
     * @param key The key to retrieve
     * @param defaultValue Optional default if key is missing
     */
    getBoolean(key, defaultValue) {
        var _a;
        const v = (_a = this.request) === null || _a === void 0 ? void 0 : _a[key];
        if (v === undefined || v === null) {
            return defaultValue;
        }
        if (typeof v === 'boolean') {
            return v;
        }
        // Handle string coercion
        if (v === 'true' || v === '1' || v === 1)
            return true;
        if (v === 'false' || v === '0' || v === 0)
            return false;
        return defaultValue;
    }
    /**
     * Require a string value - throws if missing or empty
     * @param key The key to retrieve
     */
    requireString(key) {
        const v = this.getString(key);
        if (v === undefined) {
            throw new Error(`Missing required parameter '${key}'`);
        }
        return v;
    }
    /**
     * Require a number value - throws if missing or not a valid number
     * @param key The key to retrieve
     */
    requireNumber(key) {
        const v = this.getNumber(key);
        if (v === undefined) {
            throw new Error(`Missing required parameter '${key}'`);
        }
        return v;
    }
    /**
     * Require a boolean value - throws if missing
     * @param key The key to retrieve
     */
    requireBoolean(key) {
        const v = this.getBoolean(key);
        if (v === undefined) {
            throw new Error(`Missing required parameter '${key}'`);
        }
        return v;
    }
    /**
     * Map method to be implemented by concrete mappers
     */
    map(request) {
        this.request = request;
        return this.mapInternal();
    }
}
/**
 * Field type enum for schema definitions
 */
var FieldType;
(function (FieldType) {
    FieldType["String"] = "string";
    FieldType["Number"] = "number";
    FieldType["Boolean"] = "boolean";
    FieldType["Any"] = "any";
})(FieldType || (FieldType = {}));
/**
 * Generic schema-based request mapper for DoGet/DoPost endpoints
 * Eliminates need for custom mapper classes in simple cases
 */
class SchemaRequestMapper extends NormalizedRequestMapper {
    constructor(schema) {
        super();
        this.schema = schema;
    }
    mapInternal() {
        const result = {};
        // Process field specifications
        if (this.schema.fields) {
            for (const fieldSpec of this.schema.fields) {
                const targetKey = fieldSpec.targetKey || fieldSpec.key;
                let value;
                // Get value based on type and required flag
                switch (fieldSpec.type) {
                    case FieldType.String:
                        value = fieldSpec.required
                            ? this.requireString(fieldSpec.key)
                            : this.getString(fieldSpec.key, fieldSpec.defaultValue);
                        break;
                    case FieldType.Number:
                        value = fieldSpec.required
                            ? this.requireNumber(fieldSpec.key)
                            : this.getNumber(fieldSpec.key, fieldSpec.defaultValue);
                        break;
                    case FieldType.Boolean:
                        value = fieldSpec.required
                            ? this.requireBoolean(fieldSpec.key)
                            : this.getBoolean(fieldSpec.key, fieldSpec.defaultValue);
                        break;
                    case FieldType.Any:
                        value = this.request[fieldSpec.key];
                        if (value === undefined && fieldSpec.required) {
                            throw new Error(`Missing required parameter '${fieldSpec.key}'`);
                        }
                        if (value === undefined) {
                            value = fieldSpec.defaultValue;
                        }
                        break;
                }
                // Apply custom transformation if provided
                if (fieldSpec.transform && value !== undefined) {
                    value = fieldSpec.transform(value);
                }
                // Only set if value is not undefined
                if (value !== undefined) {
                    result[targetKey] = value;
                }
            }
        }
        return result;
    }
}

;// ./modules/rest-framework/index.ts
/**
 * RestFramework Module - Entry Point
 */








__webpack_require__.g.Logger = __webpack_exports__.Logger;
__webpack_require__.g.ErrorHandler = __webpack_exports__.ErrorHandler;
__webpack_require__.g.ApiResponseFormatter = __webpack_exports__.ApiResponseFormatter;
__webpack_require__.g.ApiController = __webpack_exports__.ApiController;
__webpack_require__.g.executeRoute = __webpack_exports__.executeRoute;
__webpack_require__.g.NormalizedRequestMapper = __webpack_exports__.NormalizedRequestMapper;
__webpack_require__.g.SchemaRequestMapper = __webpack_exports__.SchemaRequestMapper;
__webpack_require__.g.FieldType = __webpack_exports__.FieldType;
;// ./modules/testing/Test.ts
/**
 * Testing Module - Test Case Management
 */
const cases = [];
/**
 * Register a test case
 * @param name Test case name
 * @param fn Test function
 * @param category Optional category for grouping tests
 */
function it(name, fn, category) {
    cases.push({ name, fn, category });
}
/**
 * Get all registered test cases
 */
function Test_all() {
    return cases.slice();
}
/**
 * Get test cases by category
 */
function byCategory(category) {
    return cases.filter((c) => c.category === category);
}
/**
 * Get all unique categories
 */
function categories() {
    const cats = new Set();
    cases.forEach((c) => {
        if (c.category)
            cats.add(c.category);
    });
    return Array.from(cats).sort();
}
/**
 * Get test case with default category
 */
function getCaseWithCategory(testCase) {
    return {
        ...testCase,
        category: testCase.category || 'General'
    };
}
/**
 * Clear all registered test cases
 */
function clear() {
    cases.length = 0;
}
__webpack_require__.g.it = __webpack_exports__.it;
__webpack_require__.g.all = __webpack_exports__.all;
__webpack_require__.g.byCategory = __webpack_exports__.byCategory;
__webpack_require__.g.categories = __webpack_exports__.categories;
__webpack_require__.g.getCaseWithCategory = __webpack_exports__.getCaseWithCategory;
__webpack_require__.g.clear = __webpack_exports__.clear;
;// ./modules/testing/Runner.ts
/**
 * Testing Module - Test Runner
 */

/**
 * Run all registered test cases
 */
function runAll() {
    var _a;
    const results = [];
    for (const c of Test_all()) {
        const t0 = Date.now();
        const testCase = getCaseWithCategory(c);
        try {
            c.fn();
            results.push({
                name: c.name,
                ok: true,
                ms: Date.now() - t0,
                category: testCase.category
            });
        }
        catch (e) {
            results.push({
                name: c.name,
                ok: false,
                error: String((_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : e),
                ms: Date.now() - t0,
                category: testCase.category
            });
        }
    }
    return results;
}
/**
 * Run test cases by category
 */
function runByCategory(category) {
    var _a;
    const results = [];
    for (const c of byCategory(category)) {
        const t0 = Date.now();
        const testCase = getCaseWithCategory(c);
        try {
            c.fn();
            results.push({
                name: c.name,
                ok: true,
                ms: Date.now() - t0,
                category: testCase.category
            });
        }
        catch (e) {
            results.push({
                name: c.name,
                ok: false,
                error: String((_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : e),
                ms: Date.now() - t0,
                category: testCase.category
            });
        }
    }
    return results;
}
/**
 * Get summary of test results
 */
function summarize(results) {
    return {
        total: results.length,
        passed: results.filter((r) => r.ok).length,
        failed: results.filter((r) => !r.ok).length,
        duration: results.reduce((sum, r) => sum + r.ms, 0)
    };
}
__webpack_require__.g.runAll = __webpack_exports__.runAll;
__webpack_require__.g.runByCategory = __webpack_exports__.runByCategory;
__webpack_require__.g.summarize = __webpack_exports__.summarize;
;// ./modules/testing/Assert.ts
/**
 * Testing Module - Assertion Utilities
 */
/**
 * Assert that a value is truthy
 */
function isTrue(v, msg) {
    if (!v)
        fail(msg !== null && msg !== void 0 ? msg : `Expected truthy but got: ${v}`);
}
/**
 * Assert that a value is falsy
 */
function isFalse(v, msg) {
    if (v)
        fail(msg !== null && msg !== void 0 ? msg : `Expected falsy but got: ${v}`);
}
/**
 * Assert that two values are equal (deep comparison via JSON)
 */
function equals(a, b, msg) {
    const ok = JSON.stringify(a) === JSON.stringify(b);
    if (!ok)
        fail(msg !== null && msg !== void 0 ? msg : `Not equal:\nA=${JSON.stringify(a)}\nB=${JSON.stringify(b)}`);
}
/**
 * Assert that a function throws an error
 */
function Assert_throws(fn, msg) {
    let threw = false;
    try {
        fn();
    }
    catch {
        threw = true;
    }
    if (!threw)
        fail(msg !== null && msg !== void 0 ? msg : `Expected function to throw, but it did not.`);
}
/**
 * Fail the test with a custom message
 */
function fail(msg) {
    throw new Error(`[Assert] ${msg}`);
}
/**
 * Assert that a value is not null or undefined
 */
function notNull(v, msg) {
    if (v == null)
        fail(msg !== null && msg !== void 0 ? msg : `Expected non-null value but got: ${v}`);
}
/**
 * Assert that two values are strictly equal (===)
 */
function strictEquals(a, b, msg) {
    if (a !== b)
        fail(msg !== null && msg !== void 0 ? msg : `Not strictly equal:\nA=${a}\nB=${b}`);
}
/**
 * Assert that an array contains a specific item
 */
function contains(arr, item, msg) {
    if (!arr.includes(item)) {
        fail(msg !== null && msg !== void 0 ? msg : `Array does not contain item:\nArray=${JSON.stringify(arr)}\nItem=${JSON.stringify(item)}`);
    }
}
/**
 * Assert that an array has a specific length
 */
function hasLength(arr, expectedLength, msg) {
    if (arr.length !== expectedLength) {
        fail(msg !== null && msg !== void 0 ? msg : `Expected array length ${expectedLength} but got ${arr.length}`);
    }
}
__webpack_require__.g.isTrue = __webpack_exports__.isTrue;
__webpack_require__.g.isFalse = __webpack_exports__.isFalse;
__webpack_require__.g.equals = __webpack_exports__.equals;
__webpack_require__.g.throws = __webpack_exports__.throws;
__webpack_require__.g.fail = __webpack_exports__.fail;
__webpack_require__.g.notNull = __webpack_exports__.notNull;
__webpack_require__.g.strictEquals = __webpack_exports__.strictEquals;
__webpack_require__.g.contains = __webpack_exports__.contains;
__webpack_require__.g.hasLength = __webpack_exports__.hasLength;
;// ./modules/testing/GasReporter.ts
/**
 * Testing Module - GAS Reporter
 */
/**
 * Print test results in GAS Logger format
 */
function print(results) {
    const ok = results.filter((r) => r.ok).length;
    const ng = results.length - ok;
    // Use Logger if available (GAS environment), otherwise fall back to console
    const logger = typeof Logger !== 'undefined' ? Logger : console;
    logger.log(`[TEST] total=${results.length} ok=${ok} ng=${ng}`);
    // Group results by category for organized output
    const categories = new Map();
    results.forEach((r) => {
        const cat = r.category || 'General';
        if (!categories.has(cat)) {
            categories.set(cat, []);
        }
        categories.get(cat).push(r);
    });
    // Print results by category
    for (const [category, categoryResults] of categories) {
        const catOk = categoryResults.filter((r) => r.ok).length;
        const catNg = categoryResults.length - catOk;
        logger.log(`\n📂 [${category}] ${categoryResults.length} tests (✅${catOk} ❌${catNg})`);
        for (const r of categoryResults) {
            logger.log(`  ${r.ok ? '✅' : '❌'} ${r.name} (${r.ms}ms)${r.error ? ' :: ' + r.error : ''}`);
        }
    }
    if (ng > 0)
        throw new Error(`There were ${ng} failing tests`);
}
/**
 * Print test results for a specific category
 */
function printCategory(results, category) {
    const ok = results.filter((r) => r.ok).length;
    const ng = results.length - ok;
    // Use Logger if available (GAS environment), otherwise fall back to console
    const logger = typeof Logger !== 'undefined' ? Logger : console;
    logger.log(`\n📂 [${category}] total=${results.length} ok=${ok} ng=${ng}`);
    for (const r of results) {
        logger.log(`  ${r.ok ? '✅' : '❌'} ${r.name} (${r.ms}ms)${r.error ? ' :: ' + r.error : ''}`);
    }
    if (ng > 0)
        throw new Error(`There were ${ng} failing tests in category ${category}`);
}
/**
 * Format test results as HTML for web display
 */
function toHtml(results) {
    const ok = results.filter((r) => r.ok).length;
    const ng = results.length - ok;
    let html = `<!DOCTYPE html><html><head><style>
        body { font-family: sans-serif; margin: 20px; }
        .summary { padding: 10px; margin-bottom: 20px; border-radius: 5px; }
        .summary.pass { background: #d4edda; color: #155724; }
        .summary.fail { background: #f8d7da; color: #721c24; }
        .category { margin: 20px 0; }
        .test { padding: 8px; margin: 5px 0; border-radius: 3px; }
        .test.pass { background: #d4edda; }
        .test.fail { background: #f8d7da; }
        .error { color: #721c24; margin-top: 5px; font-size: 0.9em; }
    </style></head><body>`;
    html += `<div class="summary ${ng === 0 ? 'pass' : 'fail'}">`;
    html += `<h2>Test Results</h2>`;
    html += `<p>Total: ${results.length} | Passed: ${ok} | Failed: ${ng}</p>`;
    html += `</div>`;
    // Group by category
    const categories = new Map();
    results.forEach((r) => {
        const cat = r.category || 'General';
        if (!categories.has(cat)) {
            categories.set(cat, []);
        }
        categories.get(cat).push(r);
    });
    for (const [category, categoryResults] of categories) {
        const catOk = categoryResults.filter((r) => r.ok).length;
        const _catNg = categoryResults.length - catOk;
        html += `<div class="category">`;
        html += `<h3>📂 ${category} (${catOk}/${categoryResults.length} passed)</h3>`;
        for (const r of categoryResults) {
            html += `<div class="test ${r.ok ? 'pass' : 'fail'}">`;
            html += `${r.ok ? '✅' : '❌'} ${r.name} <em>(${r.ms}ms)</em>`;
            if (r.error) {
                html += `<div class="error">${r.error}</div>`;
            }
            html += `</div>`;
        }
        html += `</div>`;
    }
    html += `</body></html>`;
    return html;
}
__webpack_require__.g.print = __webpack_exports__.print;
__webpack_require__.g.printCategory = __webpack_exports__.printCategory;
__webpack_require__.g.toHtml = __webpack_exports__.toHtml;
;// ./modules/testing/TestHelpers.ts
/**
 * Testing Module - Mock Doubles and Test Helpers
 */
/**
 * Mock Logger for testing
 */
class MockLogger {
    constructor() {
        this.messages = [];
    }
    info(message) {
        this.messages.push({ level: 'info', message });
    }
    error(message) {
        this.messages.push({ level: 'error', message });
    }
    reset() {
        this.messages = [];
    }
    getLastMessage(level) {
        var _a;
        const filtered = level ? this.messages.filter((m) => m.level === level) : this.messages;
        return (_a = filtered[filtered.length - 1]) === null || _a === void 0 ? void 0 : _a.message;
    }
    getAllMessages(level) {
        const filtered = level ? this.messages.filter((m) => m.level === level) : this.messages;
        return filtered.map((m) => m.message);
    }
    contains(substring, level) {
        return this.getAllMessages(level).some((msg) => msg.includes(substring));
    }
}
/**
 * Mock Clock for testing time-based logic
 */
class MockClock {
    constructor(initialTime) {
        this.currentTime = initialTime instanceof Date ? initialTime.getTime() : initialTime || Date.now();
    }
    now() {
        // Handle invalid time edge case
        if (!Number.isFinite(this.currentTime)) {
            return new Date(NaN);
        }
        return new Date(this.currentTime);
    }
    advance(ms) {
        this.currentTime += ms;
    }
    setTime(time) {
        this.currentTime = time instanceof Date ? time.getTime() : time;
    }
    reset() {
        this.currentTime = Date.now();
    }
}
/**
 * Assertion helpers for testing
 */
var Assertions;
(function (Assertions) {
    function assertLoggerContains(logger, substring, level) {
        if (!logger.contains(substring, level)) {
            const levelStr = level ? ` (${level})` : '';
            const messages = logger.getAllMessages(level).join('\n  ');
            throw new Error(`Expected logger${levelStr} to contain "${substring}".\nActual messages:\n  ${messages || '(none)'}`);
        }
    }
    Assertions.assertLoggerContains = assertLoggerContains;
    function assertArrayContains(arr, item, message) {
        if (!arr.includes(item)) {
            throw new Error(message || `Expected array to contain ${JSON.stringify(item)}`);
        }
    }
    Assertions.assertArrayContains = assertArrayContains;
    function assertDeepEqual(actual, expected, message) {
        const actualJson = JSON.stringify(actual);
        const expectedJson = JSON.stringify(expected);
        if (actualJson !== expectedJson) {
            throw new Error(message ||
                `Deep equality failed.\nExpected: ${expectedJson}\nActual:   ${actualJson}`);
        }
    }
    Assertions.assertDeepEqual = assertDeepEqual;
    function assertThrows(fn, expectedError) {
        try {
            fn();
            throw new Error('Expected function to throw, but it did not');
        }
        catch (err) {
            if (!expectedError)
                return; // Just check that it throws
            const message = (err === null || err === void 0 ? void 0 : err.message) || String(err);
            if (typeof expectedError === 'string') {
                if (!message.includes(expectedError)) {
                    throw new Error(`Expected error to contain "${expectedError}", but got: "${message}"`);
                }
            }
            else {
                if (!expectedError.test(message)) {
                    throw new Error(`Expected error to match ${expectedError}, but got: "${message}"`);
                }
            }
        }
    }
    Assertions.assertThrows = assertThrows;
})(Assertions || (Assertions = {}));

;// ./modules/testing/index.ts
/**
 * Testing Module - Entry Point
 */






;// ./modules/test-runner/Types.ts
/**
 * Test Runner Module - Type Definitions
 */


;// ./modules/test-runner/HtmlReporter.ts
/**
 * Test Runner Module - HTML Reporter
 */
const DEFAULT_CSS = `
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background: #f5f5f5;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    padding: 24px;
}

.header {
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 16px;
    margin-bottom: 24px;
}

.header h1 {
    margin: 0 0 8px 0;
    color: #333;
}

.summary {
    display: flex;
    gap: 16px;
    padding: 16px;
    border-radius: 6px;
    margin-bottom: 24px;
    font-size: 16px;
}

.summary.pass {
    background: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
}

.summary.fail {
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
}

.summary-item {
    display: flex;
    flex-direction: column;
}

.summary-item label {
    font-size: 12px;
    opacity: 0.8;
    margin-bottom: 4px;
}

.summary-item value {
    font-size: 24px;
    font-weight: bold;
}

.category {
    margin-bottom: 24px;
}

.category-header {
    background: #f8f9fa;
    padding: 12px 16px;
    border-radius: 6px 6px 0 0;
    border-left: 4px solid #007bff;
    font-weight: 600;
    color: #333;
}

.category-header .badge {
    float: right;
    background: #007bff;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
}

.test-list {
    border: 1px solid #e0e0e0;
    border-top: none;
    border-radius: 0 0 6px 6px;
}

.test {
    padding: 12px 16px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    transition: background 0.2s;
}

.test:last-child {
    border-bottom: none;
}

.test:hover {
    background: #f8f9fa;
}

.test.pass {
    border-left: 3px solid #28a745;
}

.test.fail {
    border-left: 3px solid #dc3545;
    background: #fff5f5;
}

.test-icon {
    font-size: 18px;
    margin-right: 12px;
}

.test-name {
    flex: 1;
    color: #333;
}

.test-time {
    color: #666;
    font-size: 14px;
    margin-left: 12px;
}

.test-time.slow {
    color: #ff9800;
    font-weight: bold;
}

.test-error {
    color: #721c24;
    margin: 8px 0 0 30px;
    padding: 8px;
    background: #f8d7da;
    border-radius: 4px;
    font-size: 14px;
    font-family: 'Courier New', monospace;
}

.footer {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #e0e0e0;
    text-align: center;
    color: #666;
    font-size: 14px;
}

.no-tests {
    text-align: center;
    padding: 48px;
    color: #666;
}

@media print {
    body {
        background: white;
    }
    .container {
        box-shadow: none;
    }
}
`;
/**
 * Generate HTML report from test results
 */
function generate(results, options = {}) {
    const { showDetails = true, groupByCategory = true, includeStyles = true, customCss = '' } = options;
    const ok = results.filter((r) => r.ok).length;
    const ng = results.length - ok;
    const totalMs = results.reduce((sum, r) => sum + r.ms, 0);
    let html = '<!DOCTYPE html><html lang="ja"><head>';
    html += '<meta charset="UTF-8">';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
    html += '<title>Test Results</title>';
    if (includeStyles) {
        html += `<style>${DEFAULT_CSS}${customCss}</style>`;
    }
    html += '</head><body>';
    html += '<div class="container">';
    // Header
    html += '<div class="header">';
    html += '<h1>🧪 Test Results</h1>';
    html += `<p>Executed: ${new Date().toLocaleString('ja-JP')}</p>`;
    html += '</div>';
    // Summary
    const summaryClass = ng === 0 ? 'pass' : 'fail';
    html += `<div class="summary ${summaryClass}">`;
    html += '<div class="summary-item">';
    html += '<label>Total</label>';
    html += `<value>${results.length}</value>`;
    html += '</div>';
    html += '<div class="summary-item">';
    html += '<label>✅ Passed</label>';
    html += `<value>${ok}</value>`;
    html += '</div>';
    html += '<div class="summary-item">';
    html += '<label>❌ Failed</label>';
    html += `<value>${ng}</value>`;
    html += '</div>';
    html += '<div class="summary-item">';
    html += '<label>⏱️ Total Time</label>';
    html += `<value>${totalMs}ms</value>`;
    html += '</div>';
    html += '</div>';
    if (results.length === 0) {
        html += '<div class="no-tests">No tests found</div>';
    }
    else if (showDetails) {
        if (groupByCategory) {
            html += generateCategoryView(results);
        }
        else {
            html += generateFlatView(results);
        }
    }
    // Footer
    html += '<div class="footer">';
    html += 'Powered by GAS App Framework Test Runner';
    html += '</div>';
    html += '</div></body></html>';
    return html;
}
/**
 * Generate category-grouped view
 */
function generateCategoryView(results) {
    const categories = new Map();
    results.forEach((r) => {
        const cat = r.category || 'Uncategorized';
        if (!categories.has(cat)) {
            categories.set(cat, []);
        }
        categories.get(cat).push(r);
    });
    let html = '';
    for (const [category, tests] of categories) {
        const catOk = tests.filter((r) => r.ok).length;
        const catTotal = tests.length;
        html += '<div class="category">';
        html += '<div class="category-header">';
        html += `📂 ${category}`;
        html += `<span class="badge">${catOk}/${catTotal}</span>`;
        html += '</div>';
        html += '<div class="test-list">';
        for (const test of tests) {
            html += formatTestItem(test);
        }
        html += '</div>';
        html += '</div>';
    }
    return html;
}
/**
 * Generate flat list view
 */
function generateFlatView(results) {
    let html = '<div class="test-list">';
    for (const test of results) {
        html += formatTestItem(test);
    }
    html += '</div>';
    return html;
}
/**
 * Format individual test item
 */
function formatTestItem(test) {
    const status = test.ok ? 'pass' : 'fail';
    const icon = test.ok ? '✅' : '❌';
    const timeClass = test.ms > 1000 ? 'slow' : '';
    let html = `<div class="test ${status}">`;
    html += `<span class="test-icon">${icon}</span>`;
    html += `<span class="test-name">${escapeHtml(test.name)}</span>`;
    html += `<span class="test-time ${timeClass}">${test.ms}ms</span>`;
    html += '</div>';
    if (test.error) {
        html += `<div class="test-error">${escapeHtml(test.error)}</div>`;
    }
    return html;
}
/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
/**
 * Generate JSON report
 */
function toJson(results) {
    const ok = results.filter((r) => r.ok).length;
    const ng = results.length - ok;
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            total: results.length,
            passed: ok,
            failed: ng
        },
        results: results.map((r) => ({
            name: r.name,
            category: r.category || 'Uncategorized',
            ok: r.ok,
            ms: r.ms,
            error: r.error || null
        }))
    };
    return JSON.stringify(report, null, 2);
}
__webpack_require__.g.generate = __webpack_exports__.generate;
__webpack_require__.g.toJson = __webpack_exports__.toJson;
;// ./modules/test-runner/WebTestRunner.ts
/**
 * Test Runner Module - Web Test Runner
 *
 * Provides a web-based test runner accessible via doGet() in Google Apps Script
 */



/**
 * Main Web Test Runner
 */
class WebTestRunner {
    constructor(config = {}) {
        this.config = config;
    }
    /**
     * Handle doGet request for test execution
     */
    handleRequest(e) {
        const request = this.parseRequest(e);
        if (request.list) {
            return this.renderTestList();
        }
        if (request.category) {
            return this.runCategoryTests(request.category, request.format);
        }
        if (request.all !== false) {
            // Default: run all tests
            return this.runAllTests(request.format);
        }
        return this.renderIndexPage();
    }
    /**
     * Parse URL parameters into TestRequest
     */
    parseRequest(e) {
        const params = e.parameter || {};
        return {
            all: params.all !== undefined ? params.all === 'true' : true,
            category: params.category,
            list: params.list === 'true',
            format: params.format || 'html'
        };
    }
    /**
     * Run all tests and return HTML output
     */
    runAllTests(format = 'html') {
        const results = runAll();
        if (format === 'json') {
            const json = toJson(results);
            return HtmlService.createHtmlOutput(`<pre>${json}</pre>`).setTitle('Test Results (JSON)');
        }
        const html = generate(results, {
            showDetails: true,
            groupByCategory: true
        });
        return HtmlService.createHtmlOutput(html)
            .setTitle(this.config.title || 'Test Results')
            .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    /**
     * Run tests for specific category
     */
    runCategoryTests(category, format = 'html') {
        const results = runByCategory(category);
        if (format === 'json') {
            const json = toJson(results);
            return HtmlService.createHtmlOutput(`<pre>${json}</pre>`).setTitle(`${category} - Test Results (JSON)`);
        }
        const html = generate(results, {
            showDetails: true,
            groupByCategory: false
        });
        return HtmlService.createHtmlOutput(html)
            .setTitle(`${category} - Test Results`)
            .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    /**
     * Render test category list
     */
    renderTestList() {
        const tests = Test_all();
        const categories = new Map();
        tests.forEach((t) => {
            const cat = t.category || 'Uncategorized';
            categories.set(cat, (categories.get(cat) || 0) + 1);
        });
        let html = '<!DOCTYPE html><html><head>';
        html += '<meta charset="UTF-8">';
        html += '<title>Available Tests</title>';
        html += '<style>';
        html += 'body { font-family: sans-serif; margin: 20px; }';
        html += 'h1 { color: #333; }';
        html += 'ul { list-style: none; padding: 0; }';
        html += 'li { padding: 8px; margin: 4px 0; background: #f0f0f0; border-radius: 4px; }';
        html += 'a { color: #007bff; text-decoration: none; }';
        html += 'a:hover { text-decoration: underline; }';
        html += '.badge { background: #007bff; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 8px; }';
        html += '</style>';
        html += '</head><body>';
        html += '<h1>📋 Available Test Categories</h1>';
        html += `<p>Total: ${tests.length} tests in ${categories.size} categories</p>`;
        html += '<ul>';
        for (const [cat, count] of categories) {
            const url = this.buildUrl({ category: cat });
            html += '<li>';
            html += `<a href="${url}">📂 ${cat}</a>`;
            html += `<span class="badge">${count}</span>`;
            html += '</li>';
        }
        html += '</ul>';
        html += '<hr>';
        html += `<p><a href="${this.buildUrl({ all: 'true' })}">▶️ Run All Tests</a></p>`;
        html += '</body></html>';
        return HtmlService.createHtmlOutput(html)
            .setTitle('Available Tests')
            .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    /**
     * Render index/help page
     */
    renderIndexPage() {
        const tests = Test_all();
        const categories = new Set();
        tests.forEach((t) => categories.add(t.category || 'Uncategorized'));
        let html = '<!DOCTYPE html><html><head>';
        html += '<meta charset="UTF-8">';
        html += '<title>Test Runner</title>';
        html += '<style>';
        html += 'body { font-family: sans-serif; margin: 40px; max-width: 800px; }';
        html += 'h1 { color: #333; }';
        html += '.btn { display: inline-block; padding: 12px 24px; margin: 8px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; }';
        html += '.btn:hover { background: #0056b3; }';
        html += 'code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }';
        html += 'pre { background: #f4f4f4; padding: 12px; border-radius: 6px; overflow-x: auto; }';
        html += '</style>';
        html += '</head><body>';
        html += '<h1>🧪 GAS App Framework Test Runner</h1>';
        html += `<p>Found ${tests.length} tests in ${categories.size} categories</p>`;
        html += '<h2>Quick Actions</h2>';
        html += `<a href="${this.buildUrl({ all: 'true' })}" class="btn">▶️ Run All Tests</a>`;
        html += `<a href="${this.buildUrl({ list: 'true' })}" class="btn">📋 List Categories</a>`;
        html += '<h2>URL Parameters</h2>';
        html += '<ul>';
        html += '<li><code>?all=true</code> - Run all tests (default)</li>';
        html += '<li><code>?category=CategoryName</code> - Run specific category</li>';
        html += '<li><code>?list=true</code> - List all categories</li>';
        html += '<li><code>?format=json</code> - Output as JSON</li>';
        html += '</ul>';
        html += '<h2>Examples</h2>';
        html += '<pre>';
        html += `${this.buildUrl({ all: 'true' })}\n`;
        html += `${this.buildUrl({ category: 'Repository' })}\n`;
        html += `${this.buildUrl({ list: 'true' })}\n`;
        html += `${this.buildUrl({ all: 'true', format: 'json' })}`;
        html += '</pre>';
        html += '</body></html>';
        return HtmlService.createHtmlOutput(html)
            .setTitle('Test Runner')
            .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    /**
     * Build URL with parameters
     */
    buildUrl(params) {
        const base = this.config.baseUrl || ScriptApp.getService().getUrl();
        const query = Object.entries(params)
            .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
            .join('&');
        return `${base}?${query}`;
    }
}
/**
 * Create a simple doGet handler
 */
function createDoGetHandler(config) {
    const runner = new WebTestRunner(config);
    return (e) => runner.handleRequest(e);
}
__webpack_require__.g.createDoGetHandler = __webpack_exports__.createDoGetHandler;
;// ./modules/test-runner/index.ts
/**
 * Test Runner Module - Entry Point
 */




;// ./modules/index.ts
/**
 * GasAppFramework - ES Modules版エントリーポイント
 * Core modules for GAS applications
 */
// DI Module


// Shared Utilities



// Locking Module

// Repository Module

// Routing Module

// String Helper Module

// RestFramework Module

// Testing Module

// Test Runner Module

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