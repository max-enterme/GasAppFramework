namespace TAssert {
    export function isTrue(v: any, msg?: string) {
        if (!v) fail(msg ?? `Expected truthy but got: ${v}`);
    }
    export function equals<T>(a: T, b: T, msg?: string) {
        const ok = JSON.stringify(a) === JSON.stringify(b);
        if (!ok) fail(msg ?? `Not equal:\nA=${JSON.stringify(a)}\nB=${JSON.stringify(b)}`);
    }
    export function throws(fn: () => any, msg?: string) {
        let threw = false; try { fn(); } catch { threw = true; }
        if (!threw) fail(msg ?? `Expected function to throw, but it did not.`);
    }
    export function fail(msg: string): never { throw new Error(`[Assert] ${msg}`); }
}
