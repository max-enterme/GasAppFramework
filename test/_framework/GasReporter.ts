namespace TGasReporter {
    export function print(results: TRunner.Result[]) {
        const ok = results.filter(r => r.ok).length;
        const ng = results.length - ok;
        Logger.log(`[TEST] total=${results.length} ok=${ok} ng=${ng}`);
        for (const r of results) {
            Logger.log(`${r.ok ? "✅" : "❌"} ${r.name} (${r.ms}ms)${r.error ? " :: " + r.error : ""}`);
        }
        if (ng > 0) throw new Error(`There were ${ng} failing tests`);
    }
}
