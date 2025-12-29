/**
 * GasDI Decorator Tests (Node.js)
 *
 * デコレーター機能のテスト
 * GAS環境ではロード順の問題でテストが困難なため、Node.js環境でテスト
 */

import { Container, Context, Inject, Resolve } from '../../../modules/di';

describe('GasDI Decorators', () => {
    describe('property and parameter injection with Root', () => {
        it('should inject properties, constructor params, and method params', () => {
            const rootContainer = Container.Root;
            rootContainer.registerValue('answer', 42);
            rootContainer.registerFactory('svc', () => ({ hello() { return 'hi'; } }), 'singleton');

            // Define class WITHOUT decorators, then apply them manually
            class Demo {
                private a!: number;
                constructor(private s?: any) { }
                run(x?: number) {
                    return { a: this.a, b: x, hi: this.s!.hello() };
                }
            }

            // Apply decorators manually using the decorator functions
            Inject('answer')(Demo.prototype, 'a', undefined as any);  // Property injection
            Inject('svc')(Demo, undefined, 0);  // Constructor param injection
            Inject('answer')(Demo.prototype, 'run', 0);  // Method param injection

            // Apply Resolve to both class and method
            const ResolvedDemo = Resolve()(Demo, undefined, undefined as any) as any;  // Class decorator
            Resolve()(Demo.prototype, 'run', Object.getOwnPropertyDescriptor(Demo.prototype, 'run')!);  // Method resolver

            // CRITICAL: Run within Context to enable dependency resolution
            let out: any;
            Context.run(rootContainer, () => {
                const d = new ResolvedDemo() as any;
                out = d.run();
            });

            expect(out.a).toBe(42); // property injected
            expect(out.b).toBe(42); // method param injected
            expect(out.hi).toBe('hi'); // constructor param injected
        });
    });

    describe('optional injection', () => {
        it('should not throw when token is missing with optional=true', () => {
            const rootContainer = Container.Root;

            // Define class WITHOUT decorators, then apply them manually
            class Foo {
                constructor(public x?: any) { }
            }

            // Apply decorator manually with optional=true
            Inject('missing', true)(Foo, undefined, 0);  // Constructor param with optional=true
            Resolve()(Foo, undefined, undefined as any);  // Class decorator

            // Run within Context
            let f: any;
            Context.run(rootContainer, () => {
                f = new (Foo as any)();
            });

            expect(f.x).toBeUndefined(); // optional param left undefined
        });
    });
});
