import Component from "@valeera/x/src/Component";
export declare type AttributePicker = {
    name: string;
    offset: number;
    length: number;
};
export declare type AttributesNodeData = {
    name: string;
    data: Float32Array | Uint32Array | Int32Array | Uint16Array | Int16Array;
    stride: number;
    attributes: AttributePicker[];
};
export default class Geometry3 extends Component<AttributesNodeData[]> {
    /**
     * 顶点数量
     */
    count: number;
    /**
     * 拓扑类型
     */
    topology: string;
    /**
     * 剔除方式
     */
    cullMode: string;
    data: AttributesNodeData[];
    constructor(count?: number, topology?: string, cullMode?: string, data?: AttributesNodeData[]);
    addAttribute(name: string, arr: Float32Array, stride?: number, attributes?: AttributePicker[]): void;
}
