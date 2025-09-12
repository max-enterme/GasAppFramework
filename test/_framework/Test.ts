namespace T {
    export type TestFn = () => void;
    interface Case { name: string; fn: TestFn; }
    const cases: Case[] = [];
    export function it(name: string, fn: TestFn) { cases.push({ name, fn }); }
    export function all(): Case[] { return cases.slice(); }
}
