/// <reference types="dist" />
import Component from "@valeera/x/src/Component";
export declare type AttributePicker = {
    name: string;
    offset: number;
    length: number;
};
export declare type AttributesNodeData = {
    name: string;
    data: Float32Array;
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
    topology: GPUPrimitiveTopology;
    /**
     * 剔除方式
     */
    cullMode: GPUCullMode;
    data: AttributesNodeData[];
    constructor(count?: number, topology?: GPUPrimitiveTopology, cullMode?: GPUCullMode, data?: AttributesNodeData[]);
    addAttribute(name: string, arr: Float32Array, stride?: number, attributes?: AttributePicker[]): void;
    transform(matrix: Float32Array): this;
}
export declare const transformMatrix4: (a: Float32Array, m: Float32Array, offset: number) => Float32Array;
