namespace Repository.Codec {
    export function simple<TEntity extends object, Key extends keyof TEntity>(delim = '|') {
        const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(new RegExp(`[${delim}]`, 'g'), m => '\\' + m)
        return {
            stringify(key: any): string {
                const parts: string[] = []
                const ks = Object.keys(key)
                for (const k of ks) {
                    const v = key[k]
                    parts.push(esc(v == null ? '' : String(v)))
                }
                return parts.join(delim)
            },
            parse(s: string): any {
                const parts: string[] = []
                let cur = ''
                for (let i = 0; i < s.length; i++) {
                    const c = s[i]
                    if (c === '\\' && i + 1 < s.length) { cur += s[i + 1]; i++ }
                    else if (c === delim) { parts.push(cur); cur = '' }
                    else cur += c
                }
                parts.push(cur)
                // 呼び出し側で keyParameters に合わせて再構成するため、ここでは配列を返す手もあるが、Engine が再マッピングする
                return parts
            }
        } as Repository.Ports.KeyCodec<TEntity, Key> as any
    }
}
