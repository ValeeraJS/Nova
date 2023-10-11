import { Texture } from "../../systems/render"

const table = new Uint32Array(256)

for (let i = 0; i < 256; i++) {
	let c = i
	for (let k = 0; k < 8; k++) {
		c = ((c & 1) !== 0) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
	}
	table[i] = c
}

function crc32(bytes: Uint8Array, start = 0, length = bytes.length - start): number {
	let crc = -1
	for (let i = start, l = start + length; i < l; i++) {
		crc = (crc >>> 8) ^ table[(crc ^ bytes[i]) & 0xFF]
	}
	return crc ^ (-1)
}

class APNG {
	width = 0;
	height = 0;
	numPlays = 0;
	playTime = 0;
	frames: Frame[] = [];

	createImages() {
		return Promise.all(this.frames.map(f => f.createImage()));
	}
}

class Frame {
	left = 0;
	top = 0;
	width = 0;
	height = 0;
	delay = 0;
	disposeOp = 0;
	blendOp = 0;
	imageData = null;
	texture: null | Texture = null;
	dataParts: Uint8Array[] = [];

	async createImage() {
		if (this.texture) {
			return Promise.resolve(this.texture);
		}
		const image = await createImageBitmap(this.imageData);
		this.texture = new Texture({
			size: [image.width, image.height],
			source: image,
		});
		return this.texture;
	}
}
const errNotPNG = new Error("Not a PNG");
const errNotAPNG = new Error("Not an animated PNG");

const PNGSignature = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export const APngParser = (buffer: ArrayBuffer) => {
	const bytes = new Uint8Array(buffer);

	if (Array.prototype.some.call(PNGSignature, (b: number, i: number) => b !== bytes[i])) {
		return errNotPNG;
	}

	// fast animation test
	let isAnimated = false;
	eachChunk(bytes, (type: string) => !(isAnimated = (type === "acTL")));
	if (!isAnimated) {
		return errNotAPNG;
	}

	const
		preDataParts = [],
		postDataParts = [];
	let
		headerDataBytes = null,
		frame = null,
		frameNumber = 0,
		apng = new APNG();

	eachChunk(bytes, (type: string, bytes: Uint8Array, off: number, length: number) => {
		const dv = new DataView(bytes.buffer);
		switch (type) {
			case "IHDR":
				headerDataBytes = bytes.subarray(off + 8, off + 8 + length);
				apng.width = dv.getUint32(off + 8);
				apng.height = dv.getUint32(off + 12);
				break;
			case "acTL":
				apng.numPlays = dv.getUint32(off + 12);
				break;
			case "fcTL":
				if (frame) {
					apng.frames.push(frame);
					frameNumber++;
				}
				frame = new Frame();
				frame.width = dv.getUint32(off + 12);
				frame.height = dv.getUint32(off + 16);
				frame.left = dv.getUint32(off + 20);
				frame.top = dv.getUint32(off + 24);
				var delayN = dv.getUint16(off + 28);
				var delayD = dv.getUint16(off + 30);
				if (delayD === 0) {
					delayD = 100;
				}
				frame.delay = 1000 * delayN / delayD;
				apng.playTime += frame.delay;
				frame.disposeOp = dv.getUint8(off + 32);
				frame.blendOp = dv.getUint8(off + 33);
				if (frameNumber === 0 && frame.disposeOp === 2) {
					frame.disposeOp = 1;
				}
				break;
			case "fdAT":
				if (frame) {
					frame.dataParts.push(bytes.subarray(off + 12, off + 8 + length));
				}
				break;
			case "IDAT":
				if (frame) {
					frame.dataParts.push(bytes.subarray(off + 8, off + 8 + length));
				}
				break;
			case "IEND":
				postDataParts.push(subBuffer(bytes, off, 12 + length));
				break;
			default:
				preDataParts.push(subBuffer(bytes, off, 12 + length));
		}
	});

	if (frame) {
		apng.frames.push(frame);
	}

	if (apng.frames.length === 0) {
		return errNotAPNG;
	}

	const preBlob = new Blob(preDataParts),
		postBlob = new Blob(postDataParts);

	apng.frames.forEach(frame => {
		var bb = [];
		bb.push(PNGSignature);
		headerDataBytes.set(makeDWordArray(frame.width), 0);
		headerDataBytes.set(makeDWordArray(frame.height), 4);
		bb.push(makeChunkBytes("IHDR", headerDataBytes));
		bb.push(preBlob);
		frame.dataParts.forEach(p => bb.push(makeChunkBytes("IDAT", p)));
		bb.push(postBlob);
		frame.imageData = new Blob(bb, { "type": "image/png" });
		delete frame.dataParts;
		bb = null;
	});

	return apng.createImages();
}

function eachChunk(bytes: Uint8Array, callback: (a: string, b: Uint8Array, c: number, d: number) => any) {
	const dv = new DataView(bytes.buffer);
	let off = 8, type, length, res;
	do {
		length = dv.getUint32(off);
		type = readString(bytes, off + 4, 4);
		res = callback(type, bytes, off, length);
		off += 12 + length;
	} while (res !== false && type != "IEND" && off < bytes.length);
}

function readString(bytes: Uint8Array, off: number, length: number): string {
	const chars = Array.prototype.slice.call(bytes.subarray(off, off + length));
	return String.fromCharCode.apply(String, chars);
}

function makeStringArray(x: string) {
	const res = new Uint8Array(x.length);
	for (let i = 0; i < x.length; i++) {
		res[i] = x.charCodeAt(i);
	}
	return res;
}

function subBuffer(bytes: Uint8Array, start: number, length: number): Uint8Array {
	const a = new Uint8Array(length);
	a.set(bytes.subarray(start, start + length));
	return a;
}

var makeChunkBytes = function (type: string, dataBytes: Uint8Array): Uint8Array {
	const crcLen = type.length + dataBytes.length;
	const bytes = new Uint8Array(crcLen + 8);
	const dv = new DataView(bytes.buffer);

	dv.setUint32(0, dataBytes.length);
	bytes.set(makeStringArray(type), 4);
	bytes.set(dataBytes, 8);
	var crc = crc32(bytes, 4, crcLen);
	dv.setUint32(crcLen + 4, crc);
	return bytes;
};

var makeDWordArray = function (x: number) {
	return new Uint8Array([(x >>> 24) & 0xff, (x >>> 16) & 0xff, (x >>> 8) & 0xff, x & 0xff]);
};
