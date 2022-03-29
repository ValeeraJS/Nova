import WebGPUEngine from "../../engine/WebGPUEngine";
import System from "@valeera/x/src/System";
import Clearer from "./Clearer";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import IWorld, { TWorldInjection } from "@valeera/x/src/interfaces/IWorld";
import IWebGPURenderer from "./IWebGPURenderer";
import IViewport from "../IViewport";
import IScissor from "./../IScissor";
export default class RenderSystem extends System {
    engine: WebGPUEngine;
    clearer: Clearer;
    rendererMap: Map<string, IWebGPURenderer>;
    scissor: IScissor;
    viewport: IViewport;
    constructor(engine: WebGPUEngine, clearer?: Clearer, viewport?: IViewport, scissor?: IViewport);
    addRenderer(renderer: IWebGPURenderer): this;
    destroy(): this;
    handle(entity: IEntity, store: TWorldInjection): this;
    setClearer(clearer: Clearer): void;
    setViewport(viewport?: IViewport): this;
    setScissor(scissor?: IViewport): this;
    run(world: IWorld): this;
}
