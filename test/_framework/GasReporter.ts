namespace TGasReporter {
    export function print(results: TRunner.Result[]) {
        const ok = results.filter(r => r.ok).length;
        const ng = results.length - ok;
        
        // Use Logger if available (GAS environment), otherwise fall back to console
        const logger = (typeof Logger !== 'undefined') ? Logger : console;
        
        logger.log(`[TEST] total=${results.length} ok=${ok} ng=${ng}`);
        
        // Group results by category for organized output
        const categories = new Map<string, TRunner.Result[]>();
        results.forEach(r => {
            const cat = r.category || 'General';
            if (!categories.has(cat)) {
                categories.set(cat, []);
            }
            categories.get(cat)!.push(r);
        });
        
        // Print results by category
        for (const [category, categoryResults] of categories) {
            const catOk = categoryResults.filter(r => r.ok).length;
            const catNg = categoryResults.length - catOk;
            
            logger.log(`\n📂 [${category}] ${categoryResults.length} tests (✅${catOk} ❌${catNg})`);
            
            for (const r of categoryResults) {
                logger.log(`  ${r.ok ? "✅" : "❌"} ${r.name} (${r.ms}ms)${r.error ? " :: " + r.error : ""}`);
            }
        }
        
        if (ng > 0) throw new Error(`There were ${ng} failing tests`);
    }
    
    export function printCategory(results: TRunner.Result[], category: string) {
        const ok = results.filter(r => r.ok).length;
        const ng = results.length - ok;
        
        // Use Logger if available (GAS environment), otherwise fall back to console
        const logger = (typeof Logger !== 'undefined') ? Logger : console;
        
        logger.log(`\n📂 [${category}] total=${results.length} ok=${ok} ng=${ng}`);
        for (const r of results) {
            logger.log(`  ${r.ok ? "✅" : "❌"} ${r.name} (${r.ms}ms)${r.error ? " :: " + r.error : ""}`);
        }
        if (ng > 0) throw new Error(`There were ${ng} failing tests in category ${category}`);
    }
}
