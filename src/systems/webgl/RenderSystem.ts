import WebGLEngine from "../../engine/WebGLEngine";
import ASystem from "@valeera/x/src/ASystem"
import Clearer from "./Clearer";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import Renderable from "../../components/tag/Renderable";
import IWorld, { TWorldInjection } from "@valeera/x/src/interfaces/IWorld";
import IWebGLRenderer from "./IWebGLRenderer";
import IViewport from "../IViewport";
import IScissor from "./../IScissor";
import { RENDERABLE } from "../../components/constants";

export default class RenderSystem extends ASystem {
	engine: WebGLEngine;
	clearer: Clearer;
	rendererMap: Map<string, IWebGLRenderer>;
	scissor: IScissor = {
		x: 0, y: 0, width: 0, height: 0,
	};
	viewport: IViewport = {
		x: 0, y: 0, width: 0, height: 0, minDepth: 0, maxDepth: 1
	};
	constructor(engine: WebGLEngine, clearer?: Clearer, viewport?: IViewport, scissor?: IViewport) {
		super("Render System", (entity) => {
			return entity.getComponent(RENDERABLE)?.data;
		});
		this.engine = engine;
		this.clearer = clearer || new Clearer(engine);
		this.rendererMap = new Map();

		this.setScissor(scissor).setViewport(viewport);
	}

	addRenderer(renderer: IWebGLRenderer): this {
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
		this.rendererMap.get(entity.getComponent(RENDERABLE)?.data)?.render(entity, store.get("passEncoder"));
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
		let gl = this.engine.context;
		this.clearer.clear();
		gl.viewport(
			this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height);
		gl.scissor(
			this.scissor.x, this.scissor.y, this.scissor.width, this.scissor.height);
		super.run(world);
		// finish
		
		return this;
	}
}
