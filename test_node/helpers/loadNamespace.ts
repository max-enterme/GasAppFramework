import * as fs from 'fs'
import * as path from 'path'
import * as ts from 'typescript'

export function loadNamespaceTs(...relPaths: string[]) {
    for (const rel of relPaths) {
        const abs = path.resolve(process.cwd(), rel)
        const src = fs.readFileSync(abs, 'utf8')

        // namespace Foo のような宣言を拾う
        const names = Array.from(src.matchAll(/\bnamespace\s+([A-Za-z_][A-Za-z0-9_]*)/g)).map(m => m[1])
        const seen = new Set<string>()
        const uniq = names.filter(n => (seen.has(n) ? false : (seen.add(n), true)))

        const out = ts.transpileModule(src, {
            compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None, removeComments: false }
        }).outputText

        const wrapped = `
            (function(){
                ${out}
                const obj = Object.create(null);
                ${uniq.map(n => `try { if (typeof ${n} !== 'undefined') obj['${n}'] = ${n}; } catch(_) {}`).join('\n')}
                return obj;
            })()
        `

        // eslint-disable-next-line no-eval
        const result = eval(wrapped) as Record<string, any>
        for (const k of Object.keys(result)) (globalThis as any)[k] = result[k]
    }
}
