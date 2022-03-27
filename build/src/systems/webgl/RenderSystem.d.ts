import WebGLEngine from "../../engine/WebGLEngine";
import ASystem from "@valeera/x/src/ASystem";
import Clearer from "./Clearer";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import IWorld, { TWorldInjection } from "@valeera/x/src/interfaces/IWorld";
import IWebGLRenderer from "./IWebGLRenderer";
import IViewport from "../IViewport";
import IScissor from "./../IScissor";
export default class RenderSystem extends ASystem {
    engine: WebGLEngine;
    clearer: Clearer;
    rendererMap: Map<string, IWebGLRenderer>;
    scissor: IScissor;
    viewport: IViewport;
    constructor(engine: WebGLEngine, clearer?: Clearer, viewport?: IViewport, scissor?: IViewport);
    addRenderer(renderer: IWebGLRenderer): this;
    destroy(): void;
    handle(entity: IEntity, store: TWorldInjection): this;
    setClearer(clearer: Clearer): void;
    setViewport(viewport?: IViewport): this;
    setScissor(scissor?: IViewport): this;
    run(world: IWorld): this;
}
