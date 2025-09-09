namespace Routing {
    export class Router {
        private readonly _root: Node = new Routing.Node(null, "/");

        public getOrCreateNode(path: string): Node {
            let current = this._root;
            for (const relativePath of path.split('/').filter(x => x)) {
                if (!current.hasChild(relativePath)) {
                    const child = new Routing.Node(current, relativePath);
                    current.addChild(child);
                    current = child;
                }
                else {
                    current = current.getChild(relativePath);
                }
            }
            return current;
        }

        public setCallbacks(callbacks: [path: string, callback: () => any][]): void {
            callbacks.forEach(([path, callback]) => this.setCallback(path, callback));
        }

        public setCallback(path: string, callback: () => any): void {
            this.getOrCreateNode(path).setCallback(callback);
        }

        public call(path: string) {
            let current = this._root;
            for (const relativePath of path.split('/').filter(x => x)) {
                if (!current.hasChild(relativePath)) {
                    throw new Error(`Could not resolve path '${path}'`);
                }
                current = current.getChild(relativePath);
            }
            if (!current) {
                throw new Error(`Could not resolve path '${path}'`);
            }
            return current.execute();
        }
    }
}
