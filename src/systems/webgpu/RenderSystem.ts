import WebGPUEngine from "../../engine/WebGPUEngine";
import System from "@valeera/x/src/System";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import Renderable from "../../components/tag/Renderable";
import IWorld, { TWorldInjection } from "@valeera/x/src/interfaces/IWorld";
import IWebGPURenderer from "./IWebGPURenderer";
import IViewport from "../IViewport";
import IScissor from "./../IScissor";

export default class RenderSystem extends System {
	engine: WebGPUEngine;
	rendererMap: Map<string, IWebGPURenderer>;
	scissor: IScissor = {
		x: 0, y: 0, width: 0, height: 0,
	};
	viewport: IViewport = {
		x: 0, y: 0, width: 0, height: 0, minDepth: 0, maxDepth: 1
	};
	constructor(engine: WebGPUEngine, viewport?: IViewport, scissor?: IViewport) {
		super("Render System", (entity) => {
			return entity.getComponent(Renderable.TAG_TEXT)?.data;
		});
		this.engine = engine;
		this.rendererMap = new Map();
		engine.context.configure({
			device: engine.device,
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
			format: engine.preferredFormat,
			size: [engine.canvas.width, engine.canvas.height],
			compositingAlphaMode: "premultiplied"
		});
		this.setScissor(scissor).setViewport(viewport);
	}

	addRenderer(renderer: IWebGPURenderer): this {
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

	handle(entity: IEntity, store: TWorldInjection): this {
		// 根据不同类别进行渲染
		this.rendererMap.get(entity.getComponent(Renderable.TAG_TEXT)?.data)?.render(entity, store.get("activeCamera"), store.get("passEncoder"));
		return this;
	}

	setViewport(viewport?: IViewport) {
		this.viewport = viewport || {
			x: 0,
			y: 0,
			width: this.engine.canvas.width,
			height: this.engine.canvas.height,
			minDepth: 0,
			maxDepth: 1
		};
		return this;
	}

	setScissor(scissor?: IViewport) {
		this.scissor = scissor || {
			x: 0,
			y: 0,
			width: this.engine.canvas.width,
			height: this.engine.canvas.height
		};
		return this;
	}

	run(world: IWorld) {
		let passEncoder = this.engine.renderPassEncoder;
		passEncoder.setViewport(
			this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height, this.viewport.minDepth, this.viewport.maxDepth);
		passEncoder.setScissorRect(
			this.scissor.x, this.scissor.y, this.scissor.width, this.scissor.height);
		world.store.set("passEncoder", passEncoder);
		super.run(world);
		return this;
	}
}
