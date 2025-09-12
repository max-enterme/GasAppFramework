namespace StringHelper {
    export function formatString(formatText: string, ...args: Array<string | number>): string {
        let out = String(formatText)
        for (const [i, arg] of args.entries()) {
            const regExp = new RegExp('\\{' + i + '\\}', 'g')
            out = out.replace(regExp, String(arg))
        }
        return out
    }

    export function formatDate(date: Date, format: string, tz?: string | null): string {
        // GAS 環境では Utilities + Session を使用。その他環境では軽量フォーマッタ。
        try {
            // @ts-ignore
            if (typeof Utilities !== 'undefined' && typeof Session !== 'undefined' && Session.getScriptTimeZone) {
                // @ts-ignore
                const zone = typeof tz === 'string' && tz.trim() ? tz : Session.getScriptTimeZone()
                // @ts-ignore
                return Utilities.formatDate(date, zone, format)
            }
        } catch { }
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
        const v = resolveExpression(path, obj)
        return v == null ? defaultValue : v
    }

    function resolveExpression(expr: string, root: any): any {
        // Supports: a.b, a[0], func(x, 'y'), and wildcard-free simple expressions chained by dots
        const tokens = splitTopLevel(expr, '.')
        let current = root
        for (const t of tokens) {
            if (t.endsWith(')')) {
                const fnName = t.slice(0, t.indexOf('('))
                const argStr = t.slice(t.indexOf('(') + 1, -1)
                const fn = resolveSimple(current, fnName)
                if (typeof fn !== 'function') return null
                const args = parseArgs(argStr, root, current)
                current = fn.apply(current, args)
            } else {
                current = resolveSimple(current, t)
            }
            if (current == null) break
        }
        return current
    }

    function resolveSimple(base: any, token: string): any {
        // token examples: user, user[0], name
        const m = token.match(/^(.*?)\[(\d+)\]$/)
        if (m) {
            const head = m[1]
            const idx = Number(m[2])
            const obj = head ? (base ? base[head] : undefined) : base
            return obj ? obj[idx] : undefined
        }
        return base ? base[token] : undefined
    }

    function splitTopLevel(input: string, sep: string): string[] {
        const out: string[] = []
        let cur = ''
        let depth = 0
        let inS = false
        let inD = false
        for (let i = 0; i < input.length; i++) {
            const c = input[i]
            if (c === '\\') { cur += c; if (i + 1 < input.length) { cur += input[++i] }; continue }
            if (c === '\'' && !inD) { inS = !inS; cur += c; continue }
            if (c === '"' && !inS) { inD = !inD; cur += c; continue }
            if (!inS && !inD) {
                if (c === '(') depth++
                else if (c === ')') depth--
                if (depth === 0 && c === sep) { out.push(cur); cur = ''; continue }
            }
            cur += c
        }
        if (cur.length) out.push(cur)
        return out.map(s => s.trim()).filter(s => s.length > 0)
    }

    function parseArgs(argsStr: string, root: any, thisObj: any): any[] {
        const parts = splitTopLevel(argsStr, ',')
        return parts.map(p => parseArg(p, root, thisObj))
    }

    function parseArg(src: string, root: any, thisObj: any): any {
        const s = src.trim()
        if (!s) return undefined
        if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith('\'') && s.endsWith('\''))) {
            try { return JSON.parse(s.replace(/\'/g, '"')) } catch { return s.slice(1, -1) }
        }
        if (/^\d+(\.\d+)?$/.test(s)) return Number(s)
        if (s === 'true') return true
        if (s === 'false') return false
        if (s === 'null') return null
        if (s === 'undefined') return undefined
        // path lookup: prefer thisObj then root
        const fromThis = resolveExpression(s, thisObj)
        if (fromThis != null) return fromThis
        return resolveExpression(s, root)
    }
}
