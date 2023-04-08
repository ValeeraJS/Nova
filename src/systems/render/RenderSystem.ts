import { ColorGPU } from "@valeera/mathx";
import { IEntity, System, IEntityManager, ISystemManager } from "@valeera/x";
import { RENDERABLE } from "../../components/constants";
import { getColorGPU, ColorFormatType } from "../../utils/getColorGPU";
import { IRenderer } from "./IRenderer";
import { IRenderSystemInCanvas, IRenderSystemInCanvasOptions } from "./IRenderSystem";
import IViewport from "./IViewport";

export abstract class RenderSystemInCanvas extends System implements IRenderSystemInCanvas {
    context: any;
    alphaMode: string;
    viewport: IViewport = {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        minDepth: 0,
        maxDepth: 1
    };
    id: number = 0;
    cache: WeakMap<IEntity, any> = new WeakMap<IEntity, any>();
    entitySet: WeakMap<IEntityManager, Set<IEntity>> = new WeakMap<IEntityManager, Set<IEntity>>();
    loopTimes: number = 0;
    name: string = "";
    usedBy: ISystemManager[] = [];
    rendererMap: Map<string, IRenderer> = new Map();
    canvas: HTMLCanvasElement;

    options: Required<Omit<IRenderSystemInCanvasOptions, "element">> = {
        width: 0,
        height: 0,
        resolution: 1,
        alphaMode: "",
        autoResize: false,
        clearColor: new ColorGPU(),
        noDepthTexture: false
    };

    constructor(name: string, options: IRenderSystemInCanvasOptions) {
        super(name, (entity) => {
            return entity.getComponent(RENDERABLE)?.data;
        });    
        const element = options.element ?? document.body;
        const w = element.offsetWidth;
        const h = element.offsetHeight;
        if (element instanceof HTMLCanvasElement) {
            this.canvas = element;
        } else {
            this.canvas = document.createElement("canvas");
            element.appendChild(this.canvas);
        }
        this.width = options.width ?? w;
        this.height = options.height ?? h;
        this.resolution = options.resolution ?? window.devicePixelRatio;
        this.alphaMode = options.alphaMode ?? "premultiplied";
        this.clearColor = options.clearColor ?? new ColorGPU(0, 0, 0, 1);
        this.autoResize = options.autoResize ?? false;
        this.options.noDepthTexture = options.noDepthTexture ?? false;
    }

    protected clearColorGPU = new ColorGPU(0, 0, 0, 1);

    get clearColor(): ColorFormatType {
        return this.options.clearColor;
    }

    set clearColor(value: ColorFormatType) {
        getColorGPU(value, this.clearColorGPU);

        if (value instanceof Object) {
            this.options.clearColor = new Proxy(value, {
                get: (target, property, receiver) => {
                    const res = Reflect.get(target, property, receiver);
                    this.clearColor = target;
                    return res;
                },
            });
        } else {
            this.options.clearColor = value;
        }
    }

    get resolution(): number {
        return this.options.resolution;
    }

    set resolution(v: number) {
        this.options.resolution = v;

        this.resize(this.options.width, this.options.height, v);
    }

    get width(): number {
        return this.options.width;
    }

    set width(v: number) {
        this.options.width = v;

        this.resize(v, this.options.height, this.options.resolution);
    }

    get height(): number {
        return this.options.height;
    }

    set height(v: number) {
        this.options.height = v;

        this.resize(this.options.width, v, this.options.resolution);
    }

    get autoResize(): boolean {
        return this.options.autoResize;
    }

    set autoResize(v: boolean) {
        this.options.autoResize = v;
        if (v) {
            this.#turnOnAutoResize();
        } else {
            this.#turnOffAutoResize();
        }
    }


	#isResizeObserverConnect = false;
	#resizeObserver: ResizeObserver = new ResizeObserver((parent) => {
		if (parent[0]) {
			const div = parent[0].target as HTMLElement;
			this.resize(div.offsetWidth, div.offsetHeight);
		}
	});
	#turnOnAutoResize = () => {
		if (this.#isResizeObserverConnect) {
			return this;
		}
		let parent = this.canvas.parentElement;
		if (parent) {
			this.#resizeObserver.observe(parent);
			this.#isResizeObserverConnect = true;
		}
		return this;
	}
	#turnOffAutoResize = () => {
		if (!this.#isResizeObserverConnect) {
			return this;
		}
		let parent = this.canvas.parentElement;
		if (parent) {
			this.#resizeObserver.unobserve(parent);
			this.#isResizeObserverConnect = false;
		}
		return this;
	}

    addRenderer(renderer: IRenderer): this {
        if (typeof renderer.renderTypes === "string") {
            this.rendererMap.set(renderer.renderTypes, renderer);
        } else {
            for (let item of renderer.renderTypes) {
                this.rendererMap.set(item, renderer);
            }
        }
        return this;
    }

    destroy() {
        this.rendererMap.clear();

        return this;
    }

    resize(width: number, height: number, resolution: number = this.resolution): this {
        this.options.width = width;
        this.options.height = height;
        this.options.resolution = resolution;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        this.canvas.width = width * resolution;
        this.canvas.height = height * resolution;

        return this;
    }

    serialize(): any {
        return {
            id: this.id,
            name: this.name,
            type: "RenderSystem"
        };
    }
}
