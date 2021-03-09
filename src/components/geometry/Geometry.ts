import Component from "@valeera/x/src/Component";

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
    data: Float32Array | Uint32Array | Int32Array | Uint16Array | Int16Array,
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
    topology: string;
    /**
     * 剔除方式
     */
    cullMode: string;

    constructor(count: number = 0, topology: string = "triangle-list", cullMode: string = "front", data = []) {
        super('geometry3', data);
        this.count = count;
        this.topology = topology;
        this.cullMode = cullMode;
    }

    addData(name: string, arr: Float32Array, stride: number = arr.length / this.count, attributes: AttributePicker[] = []) {
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
    }
}