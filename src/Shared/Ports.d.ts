/**
 * Shared Ports - Legacy compatibility file
 * Uses triple-slash references for type inclusion in GAS
 */

/// <reference path="./CommonTypes.d.ts" />

declare namespace Shared {
    namespace Ports {
        /** @deprecated Use Shared.Types.Logger instead */
        export interface Logger extends Shared.Types.Logger {}
        
        /** @deprecated Use Shared.Types.Clock instead */
        export interface Clock extends Shared.Types.Clock {}
        
        /** @deprecated Use Shared.Types.Random instead */
        export interface Random extends Shared.Types.Random {}
    }
}
