namespace Locking.Adapters.GAS {
    export class PropertiesStore implements Locking.Ports.Store {
        constructor(private prefix: string = 'lock:') {}
        get(key: string): string | null {
            const p = PropertiesService.getScriptProperties()
            return p.getProperty(this.prefix + key) ?? null
        }
        set(key: string, value: string): void {
            PropertiesService.getScriptProperties().setProperty(this.prefix + key, value)
        }
        del(key: string): void {
            PropertiesService.getScriptProperties().deleteProperty(this.prefix + key)
        }
    }

    export class SystemClock implements Shared.Ports.Clock {
        now(): Date { return new Date() }
    }

    export class GasLogger implements Shared.Ports.Logger {
        info(msg: string): void { Logger.log(msg) }
        error(msg: string): void { Logger.log(msg) }
    }
}
