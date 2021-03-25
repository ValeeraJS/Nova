import WebGPUEngine from "../../engine/WebGPUEngine";
import ASystem from "@valeera/x/src/ASystem"
import Clearer from "./Clearer";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import Renderable from "../../components/tag/Renderable";
import IWorld, { TWorldInjection } from "@valeera/x/src/interfaces/IWorld";
import IRenderer from "./IRenderer";
import IViewport from "../IViewport";
import IScissor from "./../IScissor";

export default class RenderSystem extends ASystem {
	engine: WebGPUEngine;
	clearer: Clearer;
	swapChain: GPUSwapChain;
	rendererMap: Map<string, IRenderer>;
	scissor: IScissor = {
		x: 0, y: 0, width: 0, height: 0,
	};
	viewport: IViewport = {
		x: 0, y: 0, width: 0, height: 0, minDepth: 0, maxDepth: 1
	};
	constructor(engine: WebGPUEngine, clearer?: Clearer, viewport?: IViewport, scissor?: IViewport) {
		super("Render System", (entity) => {
			return entity.getComponent(Renderable.TAG_TEXT)?.data;
		});
		this.engine = engine;
		this.clearer = clearer || new Clearer(engine);
		this.rendererMap = new Map();
		this.swapChain = engine.context.configureSwapChain({
			device: engine.device,
			format: 'bgra8unorm',
		});
		this.setScissor(scissor).setViewport(viewport);
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
	}

	handle(entity: IEntity, store: TWorldInjection): this {
		// 根据不同类别进行渲染
		this.rendererMap.get(entity.getComponent(Renderable.TAG_TEXT)?.data)?.render(entity, store.get("activeCamera"), store.get("passEncoder"));
		return this;
	}

	setClearer(clearer: Clearer) {
		this.clearer = clearer;
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
		let device = this.engine.device;
		let commandEncoder = device.createCommandEncoder();
		let passEncoder = this.clearer.clear(commandEncoder, this.swapChain);
		passEncoder.setViewport(
			this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height, this.viewport.minDepth, this.viewport.maxDepth);
		passEncoder.setScissorRect(
			this.scissor.x, this.scissor.y, this.scissor.width, this.scissor.height);
		world.store.set("passEncoder", passEncoder);
		super.run(world);
		// finish
		passEncoder.endPass();
		device.queue.submit([commandEncoder.finish()]);
		return this;
	}
}
