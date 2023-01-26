<!DOCTYPE html>

<head>
	<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
	<link rel="stylesheet" href="./../style/common.css" />
</head>

<body>
	<canvas id="gpucanvas"></canvas>
	<script src="https://cdn.bootcdn.net/ajax/libs/dat-gui/0.7.9/dat.gui.min.js"></script>
	<script type="text/javascript" src="./../../build/Nova.js"></script>
	<script>
		const canvas = document.getElementById("gpucanvas");
		const engine = new Nova.WebGPUEngine(canvas);
		const world = new Nova.World();

		const geometry = Nova.Geometry3Factory.createTriangle3({
			a: [-1, -1, 0],
			b: [1, -1, 0],
			c: [0, 1, 0]
		});

		const mesh = Nova.EntityFactory.createMesh3(geometry);
		mesh.position.z = -5;
		const projection = new Nova.PerspectiveProjection(Math.PI / 3, canvas.width / canvas.height, 0.01, 10);
		const camera = new Nova.Camera3("test-camera", projection);

		engine.once(Nova.EngineEvents.INITED, (e) => {
			let renderSystem = new Nova.WebGPURenderSystem(engine);
			let renderer = new Nova.WebGPUMesh3Renderer(engine, camera);
			renderSystem.addRenderer(renderer);
			world.addSystem(renderSystem).add(mesh);

			createGUI();
		});

		engine.addTask(() => {
			world.run();
			mesh.rotation.y -= 0.01;
		});

		function createGUI() {
			const gui = new dat.GUI();
			const f = gui.addFolder("cull mode");
			f.add(geometry, "cullMode", [
				"none",
				"front",
				"back"
			]);
		}
	</script>
</body>
