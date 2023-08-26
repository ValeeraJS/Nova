import { IEntity } from "@valeera/x";
type RouteComponentData = {
    path: string;
    action: (entity: IEntity, matching: boolean) => any;
};
declare const HashRouteComponent_base: {
    new <T_1>(...rest: any[]): {
        parent: import("@valeera/tree").ITreeNode<T_1>;
        children: import("@valeera/tree").ITreeNode<T_1>[];
        addChild(node: import("@valeera/tree").ITreeNodeData<T_1>): any;
        depth(): number;
        findLeaves(): import("@valeera/tree").ITreeNodeData<T_1>[];
        findRoot(): import("@valeera/tree").ITreeNodeData<T_1>;
        hasAncestor(ancestor: import("@valeera/tree").ITreeNodeData<T_1>): boolean;
        removeChild(child: import("@valeera/tree").ITreeNodeData<T_1>): any;
        toArray(): import("@valeera/tree").ITreeNodeData<T_1>[];
        traverse(visitor: import("@valeera/tree").IVisitor<T_1>, rest?: any): any;
    };
    mixin: any;
    addChild<T_2>(node: import("@valeera/tree").ITreeNodeData<T_2>, child: import("@valeera/tree").ITreeNodeData<T_2>): import("@valeera/tree").ITreeNodeData<T_2>;
    depth<T_3>(node: import("@valeera/tree").ITreeNodeData<T_3>): number;
    findLeaves<T_4>(node: import("@valeera/tree").ITreeNodeData<T_4>): import("@valeera/tree").ITreeNodeData<T_4>[];
    findRoot<T_5>(node: import("@valeera/tree").ITreeNodeData<T_5>): import("@valeera/tree").ITreeNodeData<T_5>;
    hasAncestor<T_6>(node: import("@valeera/tree").ITreeNodeData<T_6>, ancestor: import("@valeera/tree").ITreeNodeData<T_6>): boolean;
    removeChild<T_7>(node: import("@valeera/tree").ITreeNodeData<T_7>, child: import("@valeera/tree").ITreeNodeData<T_7>): import("@valeera/tree").ITreeNodeData<T_7>;
    toArray<T_8>(node: import("@valeera/tree").ITreeNodeData<T_8>): import("@valeera/tree").ITreeNodeData<T_8>[];
    traverse<T_9>(node: import("@valeera/tree").ITreeNodeData<T_9>, visitor: import("@valeera/tree").IVisitor<T_9>, rest?: any): import("@valeera/tree").ITreeNodeData<T_9>;
};
export default class HashRouteComponent extends HashRouteComponent_base<RouteComponentData> {
    children: HashRouteComponent[];
    data: RouteComponentData;
    constructor(name: string, data: RouteComponentData);
    route(path: string, entity: IEntity): this;
}
export {};
