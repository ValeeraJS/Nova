import WebGPUEngine from "../../engine/WebGPUEngine";
import ASystem from "@valeera/x/src/ASystem"
import Clearer from "./Clearer";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import Renderable from "../../components/tag/Renderable";

export default class RendererSystem extends ASystem<any> {
    engine: WebGPUEngine;
    clearer: Clearer;
    swapChain: GPUSwapChain;
    constructor(engine: WebGPUEngine, clearer: Clearer) {
        super("Render System", (entity) => {
            return entity.getComponent(Renderable.TAG_TEXT)?.data;
        });
        this.engine = engine;
        this.clearer = clearer;
        this.swapChain = engine.context.configureSwapChain({
            device: engine.device,
            format: 'bgra8unorm',
        });
    }

    destroy() {

    }

    handle(entity: IEntity): this {
        console.log(this, entity);
        return this;
    }

    setClearer(clearer: Clearer) {
        this.clearer = clearer;
    }

    run() {
        let commandEncoder = this.engine.device.createCommandEncoder();
        this.clearer.clear(commandEncoder, this.swapChain);
    }
}
