import { Matrix3, Matrix4 } from "@valeera/mathx";
import { Component } from "@valeera/x";
export type AttributePicker = {
    name: string;
    offset: number;
    length: number;
};
export type AttributesNodeData = {
    name: string;
    data: Float32Array;
    stride: number;
    attributes: AttributePicker[];
};
export declare class Geometry extends Component<AttributesNodeData[]> {
    /**
     * 顶点数量
     */
    count: number;
    /**
     * 拓扑类型
     */
    dimension: number;
    topology: GPUPrimitiveTopology;
    /**
     * 剔除方式
     */
    cullMode: GPUCullMode;
    frontFace: GPUFrontFace;
    data: AttributesNodeData[];
    tags: {
        label: string;
        unique: boolean;
    }[];
    constructor(dimension: number, count?: number, topology?: GPUPrimitiveTopology, cullMode?: GPUCullMode, data?: AttributesNodeData[]);
    addAttribute(name: string, arr: Float32Array, stride?: number, attributes?: AttributePicker[]): void;
    transform(matrix: Float32Array): this;
}
export declare const transformMatrix3: (a: Float32Array, m: Matrix3, offset: number) => Float32Array;
export declare const transformMatrix4: (a: Float32Array, m: Matrix4, offset: number) => Float32Array;
