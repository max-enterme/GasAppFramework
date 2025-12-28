/**
 * Shared Time Utilities - ES Modules版
 */

export function ensureTimeZone(tz?: string | null): string {
    const s = (tz ?? '').trim();
    if (s) return s;
    try {
        if (typeof Session !== 'undefined' && Session.getScriptTimeZone) {
            return Session.getScriptTimeZone() || 'Etc/GMT';
        }
    } catch {}
    return 'Etc/GMT';
}

export function format(date: Date, pattern: string, tz?: string | null): string {
    const zone = ensureTimeZone(tz);
    try {
        if (typeof Utilities !== 'undefined' && Utilities.formatDate) {
            return Utilities.formatDate(date, zone, pattern);
        }
    } catch {}
    
    // fallback (UTC-like simple tokens)
    const pad = (n: number, w = 2) => String(n).padStart(w, '0');
    const d = new Date(date.getTime());
    const y = d.getUTCFullYear();
    const M = pad(d.getUTCMonth() + 1);
    const dd = pad(d.getUTCDate());
    const H = pad(d.getUTCHours());
    const m = pad(d.getUTCMinutes());
    const s = pad(d.getUTCSeconds());
    return pattern
        .replace(/yyyy/g, String(y))
        .replace(/MM/g, M)
        .replace(/dd/g, dd)
        .replace(/HH/g, H)
        .replace(/mm/g, m)
        .replace(/ss/g, s);
}
