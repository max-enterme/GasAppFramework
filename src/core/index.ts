/**
 * GAS App Framework - Core Module Exports
 * 
 * This file serves as the main entry point for the GAS App Framework core modules.
 * All core framework functionality is accessible through this module.
 * 
 * Usage in external projects:
 * ```typescript
 * import { ... } from 'gas-app-framework/core';
 * ```
 * 
 * @module core
 */

// Modules
/// <reference path="./modules/GasDI/Core.Types.d.ts" />
/// <reference path="./modules/GasDI/Container.ts" />
/// <reference path="./modules/GasDI/Context.ts" />
/// <reference path="./modules/GasDI/Decorators.ts" />
/// <reference path="./modules/GasDI/GenericFactory.ts" />

/// <reference path="./modules/Locking/Core.Types.d.ts" />
/// <reference path="./modules/Locking/Engine.ts" />
/// <reference path="./modules/Locking/Adapters.GAS.ts" />

/// <reference path="./modules/Repository/Core.Types.d.ts" />
/// <reference path="./modules/Repository/Engine.ts" />
/// <reference path="./modules/Repository/Errors.ts" />
/// <reference path="./modules/Repository/Adapters.Memory.ts" />
/// <reference path="./modules/Repository/Adapters.GAS.Spreadsheet.ts" />
/// <reference path="./modules/Repository/Codec.Simple.ts" />
/// <reference path="./modules/Repository/SchemaFactory.ts" />

/// <reference path="./modules/Routing/Core.Types.d.ts" />
/// <reference path="./modules/Routing/Engine.ts" />

/// <reference path="./modules/StringHelper/StringHelper.ts" />

// RestFramework
/// <reference path="./restframework/Core.Types.d.ts" />
/// <reference path="./restframework/interfaces/ApiLogic.ts" />
/// <reference path="./restframework/interfaces/RequestMapper.ts" />
/// <reference path="./restframework/interfaces/ResponseMapper.ts" />
/// <reference path="./restframework/payloads/NormalizedRequest.ts" />
/// <reference path="./restframework/payloads/NormalizedRequestMapper.ts" />
/// <reference path="./restframework/payloads/SchemaRequestMapper.ts" />
/// <reference path="./restframework/errors/ErrorHandler.ts" />
/// <reference path="./restframework/logging/Logger.ts" />
/// <reference path="./restframework/formatters/ApiResponseFormatter.ts" />
/// <reference path="./restframework/executor/RouteExecutor.ts" />
/// <reference path="./restframework/controllers/ApiController.ts" />
/// <reference path="./restframework/optional-utilities/AuthService.ts" />
/// <reference path="./restframework/optional-utilities/MiddlewareManager.ts" />
/// <reference path="./restframework/optional-utilities/RequestValidator.ts" />

// Shared
/// <reference path="./shared/CommonTypes.d.ts" />
/// <reference path="./shared/ErrorTypes.d.ts" />
/// <reference path="./shared/Errors.ts" />
/// <reference path="./shared/Time.ts" />

/**
 * Export statement for module bundlers (placeholder for future ES module support)
 * Currently, the framework uses namespace-based architecture for GAS compatibility.
 */
export {};
