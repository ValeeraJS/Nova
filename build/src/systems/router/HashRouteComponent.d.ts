import { Component, IEntity } from "@valeera/x";
type RouteComponentData = {
    path: string;
    action: (entity: IEntity, matching: boolean) => any;
};
declare const HashRouteComponent_base: {
    new (...a: any[]): {
        parent: import("@valeera/tree").ITreeNode;
        children: import("@valeera/tree").ITreeNode[];
        addChild(node: import("@valeera/tree").ITreeNodeData): any;
        depth(): number;
        findLeaves(): import("@valeera/tree").ITreeNodeData[];
        findRoot(): import("@valeera/tree").ITreeNodeData;
        hasAncestor(ancestor: import("@valeera/tree").ITreeNodeData): boolean;
        removeChild(child: import("@valeera/tree").ITreeNodeData): any;
        toArray(): import("@valeera/tree").ITreeNodeData[];
        traverse(visitor: import("@valeera/tree").IVisitor, rest?: any): any;
        constructor: Function;
        toString(): string;
        toLocaleString(): string;
        valueOf(): Object;
        hasOwnProperty(v: PropertyKey): boolean;
        isPrototypeOf(v: Object): boolean;
        propertyIsEnumerable(v: PropertyKey): boolean;
        should: Chai.Assertion;
    };
    mixin: any;
    addChild(node: import("@valeera/tree").ITreeNodeData, child: import("@valeera/tree").ITreeNodeData): import("@valeera/tree").ITreeNodeData;
    depth(node: import("@valeera/tree").ITreeNodeData): number;
    findLeaves(node: import("@valeera/tree").ITreeNodeData): import("@valeera/tree").ITreeNodeData[];
    findRoot(node: import("@valeera/tree").ITreeNodeData): import("@valeera/tree").ITreeNodeData;
    hasAncestor(node: import("@valeera/tree").ITreeNodeData, ancestor: import("@valeera/tree").ITreeNodeData): boolean;
    removeChild(node: import("@valeera/tree").ITreeNodeData, child: import("@valeera/tree").ITreeNodeData): import("@valeera/tree").ITreeNodeData;
    toArray(node: import("@valeera/tree").ITreeNodeData): import("@valeera/tree").ITreeNodeData[];
    traverse(node: import("@valeera/tree").ITreeNodeData, visitor: import("@valeera/tree").IVisitor, rest?: any): import("@valeera/tree").ITreeNodeData;
} & typeof Component;
export default class HashRouteComponent extends HashRouteComponent_base<RouteComponentData> {
    children: HashRouteComponent[];
    constructor(name: any, data: RouteComponentData);
    route(path: string, entity: IEntity): this;
}
export {};
