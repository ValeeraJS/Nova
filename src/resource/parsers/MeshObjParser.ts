import { Geometry } from "../../systems/render";
import { POSITION, NORMAL, UV } from "../../systems/render/geometry/constants";
import { IParser } from "../IResourceItem";

export const MeshObjParser: IParser<Geometry> = async (text: string) => {
	const texts = text.split('\n')
	const positionArr: number[] = [];
	const normalArr: number[] = [];
	const uvArr: number[] = [];
	const positionIndicesArr: number[] = [];
	const normalIndicesArr: number[] = [];
	const uvIndicesArr: number[] = [];

	let t: string, ts: string[];

	for (let i = 0, len = texts.length; i < len; i++) {
		t = texts[i];
		ts = t.split(' ');
		if (t.startsWith('v ')) {
			positionArr.push(parseFloat(ts[1]), parseFloat(ts[2]), parseFloat(ts[3]));
		} else if (t.startsWith('vn ')) {
			normalArr.push(parseFloat(ts[1]), parseFloat(ts[2]), parseFloat(ts[3]));
		} else if (t.startsWith('vt ')) {
			uvArr.push(parseFloat(ts[1]), parseFloat(ts[2]));
		} else if (t.startsWith('f ')) {
			if (ts[1].includes('/')) {
				let a = ts[1].split('/');
				let b = ts[2].split('/');
				let c = ts[3].split('/');

				positionIndicesArr.push(parseInt(a[0], 10), parseInt(b[0], 10), parseInt(c[0], 10));

				if (a.length === 2) {
					uvIndicesArr.push(parseInt(a[1], 10), parseInt(b[1], 10), parseInt(c[1], 10));
				} else {
					if (a[1]) {
						uvIndicesArr.push(parseInt(a[1], 10), parseInt(b[1], 10), parseInt(c[1], 10));
					}
					normalIndicesArr.push(parseInt(a[2], 10), parseInt(b[2], 10), parseInt(c[2], 10));
				}
			} else {
				positionIndicesArr.push(parseInt(ts[1], 10), parseInt(ts[2], 10), parseInt(ts[3], 10));
			}
		}
	}

	const indicesLength = positionIndicesArr.length;
	const wholeLen = indicesLength * 3;
	const positionF32 = new Float32Array(wholeLen);
	for (let i = 0; i < indicesLength; i++) {
		let index = (positionIndicesArr[i] - 1) * 3;
		positionF32[i * 3] = positionArr[index];
		positionF32[i * 3 + 1] = positionArr[index + 1];
		positionF32[i * 3 + 2] = positionArr[index + 2];
	}

	const geo = new Geometry(3, positionIndicesArr.length, "triangle-list", "none");
	geo.addAttribute(POSITION, positionF32, 3, [
		{
			name: POSITION,
			offset: 0,
			length: 3,
		}
	]);

	const normalLength = uvIndicesArr.length;
	if (normalLength) {
		const wholeLen = normalLength * 3;
		const positionF32 = new Float32Array(wholeLen);
		for (let i = 0; i < normalLength; i++) {
			let index = (normalIndicesArr[i] - 1) * 3;
			positionF32[i * 3] = normalArr[index];
			positionF32[i * 3 + 1] = normalArr[index + 1];
			positionF32[i * 3 + 2] = normalArr[index + 2];
		}
		geo.addAttribute(NORMAL, positionF32, 3, [
			{
				name: NORMAL,
				offset: 0,
				length: 3,
			}
		]);
	}

	const uvLength = uvIndicesArr.length;
	if (uvLength) {
		const wholeLen = uvLength * 2;
		const positionF32 = new Float32Array(wholeLen);
		for (let i = 0; i < uvLength; i++) {
			let index = (uvIndicesArr[i] - 1) * 2;
			positionF32[i * 2] = uvArr[index];
			positionF32[i * 2 + 1] = uvArr[index + 1];
		}
		geo.addAttribute(UV, positionF32, 2, [
			{
				name: UV,
				offset: 0,
				length: 2,
			}
		]);
	}

	return geo;
}
