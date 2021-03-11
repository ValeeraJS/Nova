import WebGPUEngine from "../../engine/WebGPUEngine";
import Clearer from "./Clearer";

export default class RendererCombiner {
    engine: WebGPUEngine;
    clearer: Clearer;
    constructor(engine: WebGPUEngine, clearer: Clearer) {
        this.engine = engine;
        this.clearer = clearer;
    }

    setClearer(clearer: Clearer) {
        this.clearer = clearer;
    }
}