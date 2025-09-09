namespace Routing {
    export class Node {
        public readonly parent: Node | null;
        public readonly path: string;

        public get children(): Node[] {
            return [...this.children.values()];
        }

        private readonly childrenMap: Map<string, Node> = new Map();

        private _callback: () => any;

        public constructor(parent: Node, path: string) {
            this.parent = parent;
            this.path = path;
        }

        public addChild(child: Node) {
            this.childrenMap.set(child.path, child);
        }

        public hasChild(path: string): boolean {
            return this.childrenMap.has(path);
        }

        public getChild(path: string): Node {
            return this.childrenMap.get(path);
        }

        public setCallback(callback: () => any): void {
            this._callback = callback;
        }

        public execute() {
            return this._callback();
        }
    }
}
