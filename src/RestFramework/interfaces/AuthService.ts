/**
 * Authentication service interface for API RestFramework (optional)
 */
declare namespace RestFramework {
    namespace Interfaces {
        /** Handles authentication and authorization */
        interface AuthService {
            authenticate(token?: string): { isAuthenticated: boolean; user?: any };
            authorize(user: any, resource: string, action: string): boolean;
        }
    }
}