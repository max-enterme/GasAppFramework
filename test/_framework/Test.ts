namespace T {
    export type TestFn = () => void;
    interface Case { name: string; fn: TestFn; category?: string; }
    const cases: Case[] = [];
    
    export function it(name: string, fn: TestFn, category?: string) { 
        cases.push({ name, fn, category }); 
    }
    
    export function all(): Case[] { return cases.slice(); }
    
    export function byCategory(category: string): Case[] {
        return cases.filter(c => c.category === category);
    }
    
    export function categories(): string[] {
        const cats = new Set<string>();
        cases.forEach(c => {
            if (c.category) cats.add(c.category);
        });
        return Array.from(cats).sort();
    }
    
    export function getCaseWithCategory(testCase: Case): Case & { category: string } {
        return {
            ...testCase,
            category: testCase.category || 'General'
        };
    }
}
