/**
 * StringHelper module wrapper for Node.js testing
 * This module provides a testable implementation of string utilities
 */

// Re-implement the StringHelper functionality for testing
export function formatString(formatText: string, ...args: Array<string | number>): string {
    let result = formatText
    for (let i = 0; i < args.length; i++) {
        const placeholder = `{${i}}`
        result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), String(args[i]))
    }
    return result
}

export function formatDate(date: Date, format: string, tz?: string | null): string {
    // Use Utilities + Session in GAS environment. Fallback to lightweight formatter in other environments.
    try {
        if (typeof (globalThis as any).Utilities !== 'undefined' && 
            typeof (globalThis as any).Session !== 'undefined' && 
            (globalThis as any).Session.getScriptTimeZone) {
            const zone = typeof tz === 'string' && tz.trim() ? tz : (globalThis as any).Session.getScriptTimeZone()
            return (globalThis as any).Utilities.formatDate(date, zone, format)
        }
    } catch { 
        // Fall through to manual implementation
    }
    
    // Fallback: limited tokens yyyy MM dd HH mm ss
    const pad = (n: number, w = 2) => String(n).padStart(w, '0')
    const y = date.getUTCFullYear()
    const M = pad(date.getUTCMonth() + 1)
    const d = pad(date.getUTCDate())
    const H = pad(date.getUTCHours())
    const m = pad(date.getUTCMinutes())
    const s = pad(date.getUTCSeconds())
    
    return format
        .replace(/yyyy/g, String(y))
        .replace(/MM/g, M)
        .replace(/dd/g, d)
        .replace(/HH/g, H)
        .replace(/mm/g, m)
        .replace(/ss/g, s)
}

export function resolveString(str: string, context: any): string {
    const placeholderPattern = /{{(.*?)}}/g
    return String(str).replace(placeholderPattern, (_match, p1) => {
        const expr = String(p1).trim()
        const v = resolveExpression(expr, context)
        return v == null ? '' : String(v)
    })
}

export function get(obj: any, path: string, defaultValue?: any): any {
    if (!path || path === '') return obj  // Return the object itself for empty path
    const v = resolveExpression(path, obj)
    return v == null ? defaultValue : v
}

function resolveExpression(expr: string, root: any): any {
    if (!expr || expr.trim() === '') return ''  // Return empty string for empty expressions
    
    // Handle simple dot notation paths
    const parts = expr.split('.')
    let current = root
    
    for (const part of parts) {
        if (current == null) return undefined
        
        // Handle array indexing [0], [1], etc.
        if (part.includes('[') && part.includes(']')) {
            const [key, indexPart] = part.split('[')
            const index = indexPart.replace(']', '')
            
            if (key) {
                current = current[key]
            }
            
            if (current != null && Array.isArray(current)) {
                current = current[parseInt(index, 10)]
            }
        } else {
            current = current[part]
        }
    }
    
    return current
}