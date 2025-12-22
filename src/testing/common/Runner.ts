namespace TRunner {
    export interface Result { name: string; ok: boolean; error?: string; ms: number; category: string; }
    
    export function runAll(): Result[] {
        const results: Result[] = [];
        for (const c of T.all()) {
            const t0 = Date.now();
            const testCase = T.getCaseWithCategory(c);
            try { 
                c.fn(); 
                results.push({ 
                    name: c.name, 
                    ok: true, 
                    ms: Date.now() - t0,
                    category: testCase.category
                }); 
            }
            catch (e: any) { 
                results.push({ 
                    name: c.name, 
                    ok: false, 
                    error: String(e?.message ?? e), 
                    ms: Date.now() - t0,
                    category: testCase.category
                }); 
            }
        }
        return results;
    }
    
    export function runByCategory(category: string): Result[] {
        const results: Result[] = [];
        for (const c of T.byCategory(category)) {
            const t0 = Date.now();
            const testCase = T.getCaseWithCategory(c);
            try { 
                c.fn(); 
                results.push({ 
                    name: c.name, 
                    ok: true, 
                    ms: Date.now() - t0,
                    category: testCase.category
                }); 
            }
            catch (e: any) { 
                results.push({ 
                    name: c.name, 
                    ok: false, 
                    error: String(e?.message ?? e), 
                    ms: Date.now() - t0,
                    category: testCase.category
                }); 
            }
        }
        return results;
    }
}
