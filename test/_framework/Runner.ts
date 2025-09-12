namespace TRunner {
    export interface Result { name: string; ok: boolean; error?: string; ms: number; }
    export function runAll(): Result[] {
        const results: Result[] = [];
        for (const c of T.all()) {
            const t0 = Date.now();
            try { c.fn(); results.push({ name: c.name, ok: true, ms: Date.now() - t0 }); }
            catch (e: any) { results.push({ name: c.name, ok: false, error: String(e?.message ?? e), ms: Date.now() - t0 }); }
        }
        return results;
    }
}
