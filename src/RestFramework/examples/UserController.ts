namespace RestFramework.Examples {
    /**
     * Example request/response types for a User API
     */
    interface UserRequest {
        id: string;
        name?: string;
        email?: string;
    }

    interface UserResponse {
        id: string;
        name: string;
        email: string;
        createdAt: string;
    }

    /**
     * Example request mapper implementation
     * Maps raw GAS request to typed UserRequest
     */
    class UserRequestMapper implements RestFramework.Types.IRequestMapper<any, UserRequest> {
        map(input: any): UserRequest {
            return {
                id: input.id || input.parameter?.id || '',
                name: input.name || input.parameter?.name,
                email: input.email || input.parameter?.email
            };
        }
    }

    /**
     * Example response mapper implementation
     * Maps business result to API response format
     */
    class UserResponseMapper implements RestFramework.Types.IResponseMapper<UserResponse, any> {
        map(input: UserResponse): any {
            return {
                user: {
                    id: input.id,
                    name: input.name,
                    email: input.email,
                    created_at: input.createdAt
                }
            };
        }
    }

    /**
     * Example business logic implementation
     * Simulates user operations
     */
    class UserApiLogic implements RestFramework.Types.IApiLogic<UserRequest, UserResponse> {
        execute(request: UserRequest): UserResponse {
            // Simulate business logic
            if (!request.id) {
                throw new Error('Invalid user ID');
            }

            return {
                id: request.id,
                name: request.name || 'Unknown User',
                email: request.email || 'unknown@example.com',
                createdAt: new Date().toISOString()
            };
        }
    }

    /**
     * Example concrete API controller
     * Demonstrates minimal implementation of BaseApiController
     */
    export class UserController extends RestFramework.BaseApiController<UserRequest, UserResponse> {
        protected readonly requestMapper = new UserRequestMapper();
        protected readonly responseMapper = new UserResponseMapper();
        protected readonly apiLogic = new UserApiLogic();

        /**
         * GAS entry point function example
         * This would be called from doGet/doPost in Apps Script
         */
        static handleRequest(request: any): RestFramework.Types.ApiResponse<any> {
            const controller = new UserController();
            return controller.handle(request);
        }
    }

    /**
     * Example GAS entry point functions
     * These demonstrate how to use the controller in Google Apps Script
     */

    /**
     * Handle GET requests in GAS
     */
    export function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
        const response = UserController.handleRequest({
            method: 'GET',
            parameter: e.parameter,
            parameters: e.parameters
        });

        return ContentService
            .createTextOutput(JSON.stringify(response))
            .setMimeType(ContentService.MimeType.JSON);
    }

    /**
     * Handle POST requests in GAS  
     */
    export function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
        let body = {};
        try {
            body = e.postData?.contents ? JSON.parse(e.postData.contents) : {};
        } catch (error) {
            // Handle JSON parse error
        }

        const response = UserController.handleRequest({
            method: 'POST',
            parameter: e.parameter,
            parameters: e.parameters,
            body: body
        });

        return ContentService
            .createTextOutput(JSON.stringify(response))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
