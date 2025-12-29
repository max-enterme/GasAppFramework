/**
 * Testing Module - Assertion Utilities
 */

/**
 * Assert that a value is truthy
 */
export function isTrue(v: any, msg?: string): void {
    if (!v) fail(msg ?? `Expected truthy but got: ${v}`);
}

/**
 * Assert that a value is falsy
 */
export function isFalse(v: any, msg?: string): void {
    if (v) fail(msg ?? `Expected falsy but got: ${v}`);
}

/**
 * Assert that two values are equal (deep comparison via JSON)
 */
export function equals<T>(a: T, b: T, msg?: string): void {
    const ok = JSON.stringify(a) === JSON.stringify(b);
    if (!ok) fail(msg ?? `Not equal:\nA=${JSON.stringify(a)}\nB=${JSON.stringify(b)}`);
}

/**
 * Assert that a function throws an error
 */
export function throws(fn: () => any, msg?: string): void {
    let threw = false;
    try {
        fn();
    } catch {
        threw = true;
    }
    if (!threw) fail(msg ?? `Expected function to throw, but it did not.`);
}

/**
 * Fail the test with a custom message
 */
export function fail(msg: string): never {
    throw new Error(`[Assert] ${msg}`);
}

/**
 * Assert that a value is not null or undefined
 */
export function notNull<T>(v: T | null | undefined, msg?: string): asserts v is T {
    if (v == null) fail(msg ?? `Expected non-null value but got: ${v}`);
}

/**
 * Assert that two values are strictly equal (===)
 */
export function strictEquals<T>(a: T, b: T, msg?: string): void {
    if (a !== b) fail(msg ?? `Not strictly equal:\nA=${a}\nB=${b}`);
}

/**
 * Assert that an array contains a specific item
 */
export function contains<T>(arr: T[], item: T, msg?: string): void {
    if (!arr.includes(item)) {
        fail(msg ?? `Array does not contain item:\nArray=${JSON.stringify(arr)}\nItem=${JSON.stringify(item)}`);
    }
}

/**
 * Assert that an array has a specific length
 */
export function hasLength(arr: any[], expectedLength: number, msg?: string): void {
    if (arr.length !== expectedLength) {
        fail(msg ?? `Expected array length ${expectedLength} but got ${arr.length}`);
    }
}
