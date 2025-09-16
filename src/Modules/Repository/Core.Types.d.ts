/**
 * Repository Core Types - Main type definitions
 * Includes shared types and repository-specific ports
 * Future ESModule: import types from separate modules
 */

/// <reference path="../../Shared/CommonTypes.d.ts" />
/// <reference path="../../Shared/ErrorTypes.d.ts" />
/// <reference path="./RepositoryPorts.d.ts" />

declare namespace Repository {
    namespace Ports {
        /** @deprecated Use Repository.Types.ErrorCode instead */
        type ErrorCode = Repository.Types.ErrorCode;
    }
}
