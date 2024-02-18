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
    #private;
    /**
     * 顶点数量
     */
    count: number;
    /**
     * 拓扑类型
     */
    dimension: number;
    data: AttributesNodeData[];
    tags: {
        label: string;
        unique: boolean;
    }[];
    constructor(dimension: number, count?: number, topology?: GPUPrimitiveTopology, cullMode?: GPUCullMode, data?: AttributesNodeData[]);
    get cullMode(): GPUCullMode;
    set cullMode(mode: GPUCullMode);
    get frontFace(): GPUFrontFace;
    set frontFace(mode: GPUFrontFace);
    get topology(): GPUPrimitiveTopology;
    set topology(mode: GPUPrimitiveTopology);
    addAttribute(name: string, arr: Float32Array, stride?: number, attributes?: AttributePicker[]): void;
    transform(matrix: Float32Array): this;
}
export declare const transformMatrix3: (a: Float32Array, m: Matrix3, offset: number) => Float32Array;
export declare const transformMatrix4: (a: Float32Array, m: Matrix4, offset: number) => Float32Array;
