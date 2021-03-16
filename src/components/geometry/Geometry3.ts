import Component from "@valeera/x/src/Component";
import { GEOMETRY_3D } from "../constants";
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
    cullMode: GPUCullMode ;
    data: AttributesNodeData[] = [];

    constructor(count: number = 0, topology: GPUPrimitiveTopology = "triangle-list", cullMode: GPUCullMode = "none", data: AttributesNodeData[] = []) {
        super(GEOMETRY_3D, data);
        this.count = count;
        this.topology = topology;
        this.cullMode = cullMode;
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

    static createTriangleGeometry(a: ArrayLike<number> = [-1, -1, 0], b: ArrayLike<number> = [1, -1, 0], c: ArrayLike<number> = [0, 1, 0]): Geometry3 {
        let geo = new Geometry3(3);
        let result = new Float32Array(9);
        result.set(a);
        result.set(b, 3);
        result.set(c, 6);
        geo.addAttribute(POSITION, result, 3);

        return geo;
    } 
}
