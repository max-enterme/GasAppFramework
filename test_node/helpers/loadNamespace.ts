import * as fs from 'fs'
import * as path from 'path'
import * as ts from 'typescript'

/**
 * Load TypeScript namespace files for Node.js testing
 * Transpiles TypeScript namespaces and makes them available globally
 * @param relPaths Relative paths to TypeScript files containing namespaces
 */
export function loadNamespaceTs(...relPaths: string[]) {
    for (const rel of relPaths) {
        const abs = path.resolve(process.cwd(), rel)
        const src = fs.readFileSync(abs, 'utf8')

        // Extract namespace declarations - handle both simple and dotted namespaces
        const namespaceMatches = Array.from(src.matchAll(/\bnamespace\s+([A-Za-z_][A-Za-z0-9_.]*)/g))
        const names = namespaceMatches.map(m => m[1])
        const seen = new Set<string>()
        const uniq = names.filter(n => (seen.has(n) ? false : (seen.add(n), true)))

        // Transpile TypeScript to JavaScript
        const out = ts.transpileModule(src, {
            compilerOptions: { 
                target: ts.ScriptTarget.ES2020, 
                module: ts.ModuleKind.None, 
                removeComments: false,
                skipLibCheck: true
            }
        }).outputText

        // Create wrapper function to execute namespace code and export to global scope
        const wrapped = `
            (function(){
                ${out}
                const obj = Object.create(null);
                ${uniq.map(n => createNamespaceExtractor(n)).join('\n')}
                return obj;
            })()
        `

        try {
            // Execute the wrapper and register namespaces globally
            // eslint-disable-next-line no-eval
            const result = eval(wrapped) as Record<string, any>
            for (const k of Object.keys(result)) {
                // Handle nested namespaces by creating the full path
                setNestedNamespace(k, result[k])
            }
        } catch (error) {
            // Log error for debugging but continue
            console.warn(`Warning: Failed to load namespace from ${rel}:`, (error as Error).message)
        }
    }
}

/**
 * Create code to extract a namespace (handles dotted namespaces)
 */
function createNamespaceExtractor(namespaceName: string): string {
    const accessPath = namespaceName
    
    return `
        try { 
            if (typeof ${accessPath} !== 'undefined') {
                obj['${namespaceName}'] = ${accessPath};
            }
        } catch(_) {
            // Ignore errors for optional namespaces
        }
    `
}

/**
 * Set nested namespace on global object
 */
function setNestedNamespace(namespaceName: string, value: any): void {
    const parts = namespaceName.split('.')
    let current = globalThis as any
    
    // Create nested structure
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i]
        if (!current[part]) {
            current[part] = {}
        }
        current = current[part]
    }
    
    // Set the final value by merging with existing namespace
    const finalPart = parts[parts.length - 1]
    if (current[finalPart] && typeof current[finalPart] === 'object' && typeof value === 'object') {
        // Merge objects instead of overwriting
        Object.assign(current[finalPart], value)
    } else {
        current[finalPart] = value
    }
}
