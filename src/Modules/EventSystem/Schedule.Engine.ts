// Placeholder (replace with your real cron evaluator). Minute-granularity.
namespace EventSystem.Schedule {
    export function occurrences(cronExpr: string, from: Date, to: Date, tz?: string | null): Date[] {
        const out: Date[] = [];
        let cur = new Date(from.getTime());
        cur.setSeconds(0, 0);
        while (cur.getTime() < to.getTime()) {
            cur = new Date(cur.getTime() + 60000);
            if (cur.getTime() <= to.getTime()) out.push(cur);
        }
        return out;
    }
    export function isDue(cronExpr: string, at: Date, tz?: string | null): boolean {
        return at.getSeconds() === 0;
    }
}
