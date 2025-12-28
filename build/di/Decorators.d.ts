/**
 * GasDI Decorators - ES Modules版
 * Dependency Injection Decorators for constructor and property injection
 */
import type { Token } from './Types';
export declare function Inject(token: Token, optional?: boolean): PropertyDecorator & ParameterDecorator;
export declare function Resolve(): ClassDecorator & MethodDecorator;
//# sourceMappingURL=Decorators.d.ts.map