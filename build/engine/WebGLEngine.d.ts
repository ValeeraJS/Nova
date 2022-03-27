import EventDispatcher from "@valeera/eventdispatcher";
import IEngine from "./IEngine";
export default class WebGLEngine extends EventDispatcher implements IEngine {
    static detect(canvas?: HTMLCanvasElement): Promise<{
        context: WebGLRenderingContext;
    }>;
    canvas: HTMLCanvasElement;
    context: WebGLRenderingContext;
    inited: boolean;
    constructor(canvas?: HTMLCanvasElement);
    createRenderer(): void;
}
