import { TreeNode } from "@valeera/tree";
import { Component, Entity } from "@valeera/x";

type RouteComponentData = {
    path: string;
    action: (entity: Entity, matching: boolean) => any
}

function fixData(data: RouteComponentData) {
    if (!data.path.startsWith("/")) {
        data.path = "/" + data.path;
    }
    return data;
}

export class HashRouteComponent extends TreeNode.mixin(Component) {
    children: HashRouteComponent[] = [];
    data: RouteComponentData;

    public constructor(data: RouteComponentData, name?: string) {
        super(fixData(data), [{
            label: "HashRoute",
            unique: false
        }], undefined, name);
    }

    public route(path: string, entity: Entity) {
        let p = this.data.path;
        if (path === p) {
            this.data.action(entity, true);
            for (let i = this.children.length - 1; i > -1; i--) {
                this.children[i].route("", entity);
            }
        } else if (path.startsWith(p)) {
            let str = path.substring(p.length);
            if (str.startsWith("/")) {
                this.data.action(entity, true);
                for (let i = this.children.length - 1; i > -1; i--) {
                    this.children[i].route(str, entity);
                }
            } else {
                this.data.action(entity, false);
                for (let i = this.children.length - 1; i > -1; i--) {
                    this.children[i].route("", entity);
                }
            }
        } else {
            this.data.action(entity, false);
            for (let i = this.children.length - 1; i > -1; i--) {
                this.children[i].route("", entity);
            }
        }

        return this;
    }
}
