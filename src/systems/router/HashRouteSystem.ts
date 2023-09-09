import { IWorld, Entity, System } from "@valeera/x";

export default class HashRouteSystem extends System {
	private static listeningHashChange = false;
	private static count = 0; // 计数
	private static listener = () => {
		HashRouteSystem.currentPath = location.hash.slice(1) || "/";
	}
	public static currentPath = location.hash.slice(1) || "/";

	public currentPath = "";
	constructor() {
		super("HashRouteSystem", (entity) => {
			return (entity as any).getFirstComponentByTagLabel("HashRoute");
		});

		HashRouteSystem.count++;

		if (!HashRouteSystem.listeningHashChange) {
			HashRouteSystem.listeningHashChange = true;
			window.addEventListener("load", HashRouteSystem.listener, false);
			window.addEventListener("hashchange", HashRouteSystem.listener, false);
		}
	}

	destroy() {
		HashRouteSystem.count--;

		if (HashRouteSystem.count < 1) {
			window.removeEventListener("load", HashRouteSystem.listener, false);
			window.removeEventListener("hashchange", HashRouteSystem.listener, false);
		}

		return this;
	}

	handle(entity: Entity): this {
		let routeComponents = entity.getComponentsByTagLabel("HashRoute") as any[];
		for (let i = routeComponents.length - 1; i > -1; i--) {
			routeComponents[i].route(this.currentPath, entity);
		}
		return this;
	}

	run(world: IWorld, time: number, delta: number) {
		if (HashRouteSystem.currentPath === this.currentPath) {
			return this;
		}
		this.currentPath = HashRouteSystem.currentPath;
		super.run(world, time, delta);
		return this;
	}
}
