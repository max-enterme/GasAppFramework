/**
 * Common error types and codes used across modules
 */
declare namespace Shared {
    namespace Types {
        /** Common domain error codes */
        type DomainErrorCode = 'InvalidArg' | 'NotFound' | 'State';
    }
}

declare namespace Repository {
    namespace Types {
        /** Repository-specific error codes */
        type ErrorCode = 'InvalidKey' | 'HeaderMissing' | 'HeaderDuplicate' | 'CodecError' | 'StoreError';
    }
}

declare namespace EventSystem {
    namespace Types {
        /** EventSystem-specific error codes */
        type ErrorCode = 'ScheduleError' | 'WorkflowError' | 'TriggerError' | 'JobError';
    }
}