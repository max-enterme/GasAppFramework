/**
 * Modern module loader for Node.js testing
 * Replaces the complex TypeScript transpilation approach with proper module exports
 */

import * as fs from 'fs'
import * as path from 'path'
import * as ts from 'typescript'

/**
 * Load and evaluate TypeScript namespace files for Node.js testing
 * This is a modernized approach that handles the namespace-based architecture
 * @param relPaths Relative paths to TypeScript files containing namespaces
 */
export function loadNamespaces(...relPaths: string[]): void {
    // First, load all the shared types and dependencies
    loadSharedDependencies()
    
    // Then load the specific modules
    for (const rel of relPaths) {
        loadSingleNamespace(rel)
    }
}

function loadSharedDependencies(): void {
    // Load Shared namespace types first
    loadSingleNamespace('src/Shared/CommonTypes.d.ts')
    loadSingleNamespace('src/Shared/ErrorTypes.d.ts')
    loadSingleNamespace('src/Shared/Errors.ts')
    
    // Load Repository core types
    loadSingleNamespace('src/Modules/Repository/Core.Types.d.ts')
    loadSingleNamespace('src/Modules/Repository/RepositoryPorts.d.ts')
    loadSingleNamespace('src/Modules/Repository/Errors.ts')
}

function loadSingleNamespace(relPath: string): void {
    const abs = path.resolve(process.cwd(), relPath)
    
    // Skip if file doesn't exist (for .d.ts files that might be optional)
    if (!fs.existsSync(abs)) {
        return
    }
    
    const src = fs.readFileSync(abs, 'utf8')
    
    // Extract namespace declarations - handle both simple and dotted namespaces
    const namespaceMatches = Array.from(src.matchAll(/\bnamespace\s+([A-Za-z_][A-Za-z0-9_.]*)/g))
    const namespaces = namespaceMatches.map(m => m[1])
    
    // Transpile TypeScript to JavaScript
    const out = ts.transpileModule(src, {
        compilerOptions: { 
            target: ts.ScriptTarget.ES2020, 
            module: ts.ModuleKind.None, 
            removeComments: false,
            skipLibCheck: true
        }
    }).outputText
    
    // Create a wrapper that exposes namespaces to global scope
    const wrapper = createNamespaceWrapper(out, namespaces)
    
    try {
        // Execute the code to register namespaces globally
        // eslint-disable-next-line no-eval
        eval(wrapper)
    } catch (error) {
        console.warn(`Warning: Failed to load namespace from ${relPath}:`, error)
    }
}

function createNamespaceWrapper(code: string, namespaces: string[]): string {
    return `
        (function() {
            // Execute the namespace code
            ${code}
            
            // Register each namespace to global scope
            ${namespaces.map(ns => `
                try {
                    if (typeof ${ns} !== 'undefined') {
                        ${createNamespaceAssignment(ns)}
                    }
                } catch (e) {
                    // Ignore assignment errors for complex nested namespaces
                }
            `).join('\n')}
        })();
    `
}

function createNamespaceAssignment(namespace: string): string {
    const parts = namespace.split('.')
    let assignment = '(globalThis as any)'
    
    // Build nested object structure
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        if (i === parts.length - 1) {
            // Last part - do the assignment
            assignment += `['${part}'] = ${namespace};`
        } else {
            // Intermediate part - ensure object exists
            assignment += `['${part}'] = ${assignment}['${part}'] || {}; ${assignment}`
        }
    }
    
    return assignment
}