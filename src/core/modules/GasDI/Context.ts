namespace GasDI {
    export class Context {
        private static _current: Container;

        static run<T>(container: Container, fn: () => T): T {
            const prev = this.current;
            Context._current = container;
            try {
                return fn();
            } finally {
                Context._current = prev;
            }
        }

        static get current(): Container {
            return Context._current ?? GasDI.Container.Root;
        }
    }
}
