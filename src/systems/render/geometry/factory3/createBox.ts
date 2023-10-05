import { Vector3 } from "@valeera/mathx";
import { NORMAL, POSITION, UV, VERTICES } from "../constants";
import { Geometry, AttributePicker } from "../Geometry";
import { DEFAULT_OPTIONS, IGeometryOptions } from "../geometryOptions";

export type IBoxGeometryOptions = {
	width: number;
	height: number;
	depth: number;
	widthSegments: number;
	heightSegments: number;
	depthSegments: number;
} & IGeometryOptions;

export const DEFAULT_BOX_OPTIONS: IBoxGeometryOptions = {
	...DEFAULT_OPTIONS,
	hasIndices: true,
	combine: true,
	width: 1,
	height: 1,
	depth: 1,
	widthSegments: 1,
	heightSegments: 1,
	depthSegments: 1,
	cullMode: "back"
};

export type IBoxGeometryOptionsInput = Partial<IBoxGeometryOptions>;

export const createBox = (options: IBoxGeometryOptionsInput = {}): Geometry => {
	let stride = 3;
	const indices: number[] = [];
	const vertices: number[] = [];
	const normals: number[] = [];
	const uvs: number[] = [];

	const { depth, height, width, depthSegments, heightSegments, widthSegments, topology, cullMode, hasUV, hasNormal, combine } = {
		...DEFAULT_BOX_OPTIONS,
		...options
	};

	let numberOfVertices = 0;

	buildPlane(2, 1, 0, - 1, - 1, depth, height, width, depthSegments, heightSegments); // px
	buildPlane(2, 1, 0, 1, - 1, depth, height, - width, depthSegments, heightSegments); // nx
	buildPlane(0, 2, 1, 1, 1, width, depth, height, widthSegments, depthSegments); // py
	buildPlane(0, 2, 1, 1, - 1, width, depth, - height, widthSegments, depthSegments); // ny
	buildPlane(0, 1, 2, 1, - 1, width, height, depth, widthSegments, heightSegments); // pz
	buildPlane(0, 1, 2, - 1, - 1, width, height, - depth, widthSegments, heightSegments); // nz

	function buildPlane(u: number, v: number, w: number, udir: number, vdir: number, width: number, height: number, depth: number, gridX: number, gridY: number) {

		const segmentWidth = width / gridX;
		const segmentHeight = height / gridY;

		const widthHalf = width / 2;
		const heightHalf = height / 2;
		const depthHalf = depth / 2;

		const gridX1 = gridX + 1;
		const gridY1 = gridY + 1;

		let vertexCounter = 0;

		const vector = new Vector3();

		// generate vertices, normals and uvs

		for (let iy = 0; iy < gridY1; iy++) {

			const y = iy * segmentHeight - heightHalf;

			for (let ix = 0; ix < gridX1; ix++) {

				const x = ix * segmentWidth - widthHalf;

				// set values to correct vector component

				vector[u] = x * udir;
				vector[v] = y * vdir;
				vector[w] = depthHalf;

				// now apply vector to vertex buffer

				vertices.push(vector.x, vector.y, vector.z);

				// set values to correct vector component

				vector[u] = 0;
				vector[v] = 0;
				vector[w] = depth > 0 ? 1 : - 1;

				// now apply vector to normal buffer

				normals.push(vector.x, vector.y, vector.z);

				// uvs

				uvs.push(ix / gridX);
				uvs.push(iy / gridY);

				// counters

				vertexCounter += 1;

			}

		}

		// indices

		for (let iy = 0; iy < gridY; iy++) {

			for (let ix = 0; ix < gridX; ix++) {

				const a = numberOfVertices + ix + gridX1 * iy;
				const b = numberOfVertices + ix + gridX1 * (iy + 1);
				const c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
				const d = numberOfVertices + (ix + 1) + gridX1 * iy;

				// faces

				indices.push(a, b, d);
				indices.push(b, c, d);

			}

		}

		// update total number of vertices

		numberOfVertices += vertexCounter;

	}

	let len = indices.length;
	let i3 = 0;
	let strideI = 0;
	let i2 = 0;
	// let count = len / 3;
	let geo = new Geometry(3, len, topology, cullMode);

	if (combine) {
		let pickers: AttributePicker[] = [{
			name: POSITION,
			offset: 0,
			length: 3,
		}];
		if (hasNormal && hasUV) {
			stride = 8;
			pickers.push({
				name: NORMAL,
				offset: 3,
				length: 3,
			});
			pickers.push({
				name: UV,
				offset: 6,
				length: 2,
			});
		} else if (hasNormal) {
			stride = 6;
			pickers.push({
				name: 'normal',
				offset: 3,
				length: 3,
			});
		} else if (hasUV) {
			stride = 5;
			pickers.push({
				name: 'uv',
				offset: 3,
				length: 2,
			});
		}
		let result = new Float32Array(stride * len);

		for (let i = 0; i < len; i++) {
			i2 = indices[i] << 1;
			i3 = indices[i] * 3;
			strideI = i * stride;
			result[0 + strideI] = vertices[i3];
			result[1 + strideI] = vertices[i3 + 1];
			result[2 + strideI] = vertices[i3 + 2];

			if (hasNormal) {
				result[3 + strideI] = normals[i3];
				result[4 + strideI] = normals[i3 + 1];
				result[5 + strideI] = normals[i3 + 2];
				if (hasUV) {
					result[6 + strideI] = uvs[i2];
					result[7 + strideI] = uvs[i2 + 1];
				}
			} else if (hasUV) {
				result[3 + strideI] = uvs[i2];
				result[4 + strideI] = uvs[i2 + 1];
			}
		}

		geo.addAttribute(VERTICES, result, stride, pickers);
		return geo;
	} else {


		return geo;
	}
}
