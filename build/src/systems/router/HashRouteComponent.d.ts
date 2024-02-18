import { Entity } from "@valeera/x";
type RouteComponentData = {
    path: string;
    action: (entity: Entity, matching: boolean) => any;
};
declare const HashRouteComponent_base: {
    new (...a: any[]): {
        parent: any;
        children: any[];
        addChild(node: import("@valeera/tree").ITreeNodeData): any;
        depth(): number;
        findLeaves(): any[];
        findRoot(): any;
        hasAncestor(ancestor: any): boolean;
        isLeaf(): boolean;
        removeChild(child: any): any;
        toArray(): any[];
        traversePostorder(visitor: import("@valeera/tree").IVisitor<any>, ...rest: any[]): any;
        traversePreorder(visitor: import("@valeera/tree").IVisitor<any>, ...rest: any[]): any;
    };
    new (value?: any): {
        parent: any;
        children: any[];
        addChild(node: import("@valeera/tree").ITreeNodeData): any;
        depth(): number;
        findLeaves(): any[];
        findRoot(): any;
        hasAncestor(ancestor: any): boolean;
        isLeaf(): boolean;
        removeChild(child: any): any;
        toArray(): any[];
        traversePostorder(visitor: import("@valeera/tree").IVisitor<any>, ...rest: any[]): any;
        traversePreorder(visitor: import("@valeera/tree").IVisitor<any>, ...rest: any[]): any;
    };
    mixin: any;
    addChild<T extends import("@valeera/tree").ITreeNodeData>(node: T, child: import("@valeera/tree").ITreeNodeData): T;
    depth(node: import("@valeera/tree").ITreeNodeData): number;
    findLeaves<T_1 extends import("@valeera/tree").ITreeNodeData>(node: T_1): T_1[];
    findRoot<T_2 extends import("@valeera/tree").ITreeNodeData>(node: T_2): import("@valeera/tree").ITreeNodeData;
    hasAncestor(node: import("@valeera/tree").ITreeNodeData, ancestor: import("@valeera/tree").ITreeNodeData): boolean;
    isLeaf(node: import("@valeera/tree").ITreeNodeData): boolean;
    removeChild<T_3 extends import("@valeera/tree").ITreeNodeData>(node: T_3, child: T_3): T_3;
    toArray<T_4 extends import("@valeera/tree").ITreeNodeData>(node: T_4): T_4[];
    traversePostorder<T_5 extends import("@valeera/tree").ITreeNodeData>(node: T_5, visitor: import("@valeera/tree").IVisitor<T_5>, ...rest: any[]): T_5;
    traversePreorder<T_6 extends import("@valeera/tree").ITreeNodeData>(node: T_6, visitor: import("@valeera/tree").IVisitor<T_6>, ...rest: any[]): T_6;
};
export declare class HashRouteComponent extends HashRouteComponent_base {
    children: HashRouteComponent[];
    data: RouteComponentData;
    constructor(data: RouteComponentData, name?: string);
    route(path: string, entity: Entity): this;
}
export {};
