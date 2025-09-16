namespace Spec_GasDI {
    T.it('register and resolve values/factories with lifetimes', () => {
        const c = new GasDI.Container()
        c.registerValue('pi', 3.14)
        c.registerFactory('now', () => ({ t: Math.random() }), 'transient')
        c.registerFactory('cfg', () => ({ a: 1 }), 'singleton')
        const a = c.resolve<number>('pi')
        const n1 = c.resolve<{ t: number }>('now')
        const n2 = c.resolve<{ t: number }>('now')
        const g1 = c.resolve<{ a: number }>('cfg')
        const g2 = c.resolve<{ a: number }>('cfg')
        TAssert.isTrue(a === 3.14, 'value ok')
        TAssert.isTrue(n1 !== n2, 'transient new each time')
        TAssert.isTrue(g1 === g2, 'singleton same instance')
    })

    T.it('scoped lifetime differs per scope', () => {
        const root = new GasDI.Container()
        root.registerFactory('req', () => ({ id: Math.random() }), 'scoped')
        const s1 = root.createScope('req-1')
        const s2 = root.createScope('req-2')
        const a1 = s1.resolve<any>('req')
        const a2 = s1.resolve<any>('req')
        const b1 = s2.resolve<any>('req')
        TAssert.isTrue(a1 === a2, 'same scope same instance')
        TAssert.isTrue(a1 !== b1, 'different scope different instance')
    })

    T.it('decorators: property and parameter injection with Root', () => {
        GasDI.Root.registerValue('answer', 42)
        GasDI.Root.registerFactory('svc', () => ({ hello() { return 'hi' } }), 'singleton')

        @GasDI.Decorators.Resolve()
        class Demo {
            @GasDI.Decorators.Inject('answer') private a!: number

            constructor(@GasDI.Decorators.Inject('svc') private s?: any) { }

            run(@GasDI.Decorators.Inject('answer') x?: number) {
                return { a: this.a, b: x, hi: this.s!.hello() }
            }
        }

        const d = new (Demo as any)() as any
        const out = d.run()
        TAssert.equals(out.a, 42, 'property injected')
        TAssert.equals(out.b, 42, 'method param injected')
        TAssert.equals(out.hi, 'hi', 'constructor param injected')
    })

    T.it('optional injection does not throw when token missing', () => {
        @GasDI.Decorators.Resolve()
        class Foo { constructor(@GasDI.Decorators.Inject('missing', true) public x?: any) { } }
        const f = new (Foo as any)()
        TAssert.isTrue(f.x === undefined, 'optional param left undefined')
    })
}
