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
  Routing: () => (/* reexport */ routing_namespaceObject),
  Shared: () => (/* reexport */ shared_namespaceObject),
  StringHelper: () => (/* reexport */ string_helper_namespaceObject),
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
                expireMs: Number(e.expireMs) || 0,
            })),
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
        },
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
        },
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
        instantiate: entityFactory,
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
            params: { ...ctx.params, ...resolved.params },
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
        dispatch,
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