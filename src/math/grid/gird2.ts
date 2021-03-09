import { add, multiply } from "../vector/Vector2";

export default class Grid2 {
    data: Float32Array[] = []; // 格子索引
    gridSize: Float32Array; // 格子尺寸，默认1*1*1
    min: Float32Array; // 格子位置，默认0,0,0
    size: Float32Array; // 格子宽高深的最大数量
    max: Float32Array;

    constructor(size: Float32Array = new Float32Array([Infinity, Infinity]), gridSize: Float32Array = new Float32Array([1, 1]), min: Float32Array = new Float32Array(2)) {
        this.size = size;
        this.gridSize = gridSize;
        this.min = min;
        this.max = add(multiply(this.gridSize, this.size), this.min);
    }
}
