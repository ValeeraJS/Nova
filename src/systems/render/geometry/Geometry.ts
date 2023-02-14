import { Matrix3, Matrix4 } from "@valeera/mathx";
import { Component } from "@valeera/x";
import { GEOMETRY } from "../../../components/constants";
import { POSITION } from "./constants";

// 顶点多种数据（位置，uv，法线等）合并为一个类型数组，每个顶点各个数据如何取数据的方式
// 在WebGPU管线中，对应会转化到vertexState.vertexBuffers里面各个元素的attributes元素信息。
// shaderLocation将从节点材质自动解析生成，外部不关心具体是哪个值。
// name表示数据名称（例如uvs，indices等），对应材质节点的名称，从而渲染器将其转化为shaderLocation
export type AttributePicker = {
    name: string,
    offset: number,
    length: number
}

// 对应转化到vertexState.vertexBuffers里面各个元素。
export type AttributesNodeData = {
    name: string,
    data: Float32Array,
    stride: number,
    attributes: AttributePicker[]
}

// 既可以是2d几何体也可以是3D几何体
export default class Geometry extends Component<AttributesNodeData[]> {
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
    data: AttributesNodeData[] = [];
    tags = [{
        label: GEOMETRY,
        unique: true
    }];

    constructor(dimension: number, count: number = 0, topology: GPUPrimitiveTopology = "triangle-list", cullMode: GPUCullMode = "none", data: AttributesNodeData[] = []) {
        super(GEOMETRY, data);
        this.count = count;
        this.cullMode = cullMode;
        this.dimension = dimension;
        this.topology = topology;
        this.frontFace = "ccw";
    }

    addAttribute(name: string, arr: Float32Array, stride: number = arr.length / this.count, attributes: AttributePicker[] = []) {
        stride = Math.floor(stride);
        if (stride * this.count < arr.length) {
            throw new Error('not fit the geometry');
        }
        if (!attributes.length) {
            attributes.push({
                name,
                offset: 0,
                length: stride
            });
        }
        this.data.push({
            name,
            data: arr,
            stride,
            attributes
        });
        this.dirty = true;
    }

    transform(matrix: Float32Array): this {
        for (let data of this.data) {
            for (let attr of data.attributes) {
                if (attr.name === POSITION) {
                    if (this.dimension === 3) {
                        for (let i = 0; i < data.data.length; i += data.stride) {
                            transformMatrix4(data.data, matrix, i + attr.offset);
                        }
                    } else {
                        for (let i = 0; i < data.data.length; i += data.stride) {
                            transformMatrix3(data.data, matrix, i + attr.offset);
                        }
                    }
                    this.dirty = true;
                    return this;
                }
            }
        }
        return this;
    }
}

let x: number, y: number;

export const transformMatrix3 = (
    a: Float32Array,
    m: Matrix3,
    offset: number,
): Float32Array => {
    x = a[offset];
    y = a[1 + offset];
    a[offset] = m[0] * x + m[3] * y + m[6];
    a[offset + 1] = m[1] * x + m[4] * y + m[7];

    return a;
};

export const transformMatrix4 = (
    a: Float32Array,
    m: Matrix4,
    offset: number,
): Float32Array => {
    let ax = a[0 + offset];
    let ay = a[1 + offset];
    let az = a[2 + offset];
    let ag = m[3 + offset] * ax + m[7] * ay + m[11] * az + m[15];
    ag = ag || 1.0;
    a[0 + offset] = (m[0] * ax + m[4] * ay + m[8] * az + m[12]) / ag;
    a[1 + offset] = (m[1] * ax + m[5] * ay + m[9] * az + m[13]) / ag;
    a[2 + offset] = (m[2] * ax + m[6] * ay + m[10] * az + m[14]) / ag;

    return a;
};
