/**
 * GasDI Context - ES Modules版
 * DI Container context management
 */
import { Container } from './Container';
export declare class Context {
    private static _current;
    static run<T>(container: Container, fn: () => T): T;
    static get current(): Container;
}
//# sourceMappingURL=Context.d.ts.map