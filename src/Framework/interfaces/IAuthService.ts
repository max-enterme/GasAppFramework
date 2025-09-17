/**
 * Authentication service interface for API Framework (optional)
 */
declare namespace Framework {
    namespace Interfaces {
        /** Handles authentication and authorization */
        interface IAuthService {
            authenticate(token?: string): { isAuthenticated: boolean; user?: any };
            authorize(user: any, resource: string, action: string): boolean;
        }
    }
}