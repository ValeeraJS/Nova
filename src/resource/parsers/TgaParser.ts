import { Texture } from "./../../systems/render/texture/Texture";
import { IParser } from "./../IResourceItem";

const TYPE_NO_DATA = 0;
const TYPE_INDEXED = 1;
const TYPE_RGB = 2;
const TYPE_GREY = 3;
const TYPE_RLE_INDEXED = 9;
const TYPE_RLE_RGB = 10;
const TYPE_RLE_GREY = 11;

const ORIGIN_BOTTOM_LEFT = 0x00;
const ORIGIN_TOP_LEFT = 0x02;
const ORIGIN_TOP_RIGHT = 0x03;
const ORIGIN_SHIFT = 0x04;
const ORIGIN_MASK = 0x30;

export interface TgaHeader {
	idLength: number;
	colorMapType: number;
	imageType: number;
	colorMapIndex: number;
	colorMapLength: number;
	colorMapDepth: number;
	offsetX: number;
	offsetY: number;
	width: number;
	height: number;
	pixelDepth: number;
	flags: number;
	hasEncoding: boolean;
	hasColorMap: boolean;
	isGreyColor: boolean;
}

export const TgaParser: IParser<Texture> = async (buffer: ArrayBuffer) => {
	const data = new Uint8Array(buffer);
	if (data.length < 0x12) {
		throw new Error('Not enough data to contain header');
	}

	const bitmap = await createImageBitmap(parse(data));
	return new Texture({
		size: [bitmap.width, bitmap.height],
		image: bitmap,
	});
}

function parse(data: Uint8Array): ImageData {
	let offset = 0;
	const header: TgaHeader = {
		/* 0x00  BYTE */ idLength: data[offset++],
		/* 0x01  BYTE */ colorMapType: data[offset++],
		/* 0x02  BYTE */ imageType: data[offset++],
		/* 0x03  WORD */ colorMapIndex: data[offset++] | (data[offset++] << 8),
		/* 0x05  WORD */ colorMapLength: data[offset++] | (data[offset++] << 8),
		/* 0x07  BYTE */ colorMapDepth: data[offset++],
		/* 0x08  WORD */ offsetX: data[offset++] | (data[offset++] << 8),
		/* 0x0a  WORD */ offsetY: data[offset++] | (data[offset++] << 8),
		/* 0x0c  WORD */ width: data[offset++] | (data[offset++] << 8),
		/* 0x0e  WORD */ height: data[offset++] | (data[offset++] << 8),
		/* 0x10  BYTE */ pixelDepth: data[offset++],
		/* 0x11  BYTE */ flags: data[offset++],
		hasEncoding: false,
		hasColorMap: false,
		isGreyColor: false,
	};

	header.hasEncoding =
		header.imageType === TYPE_RLE_INDEXED ||
		header.imageType === TYPE_RLE_RGB ||
		header.imageType === TYPE_RLE_GREY;
	header.hasColorMap =
		header.imageType === TYPE_RLE_INDEXED ||
		header.imageType === TYPE_INDEXED;
	header.isGreyColor =
		header.imageType === TYPE_RLE_GREY || header.imageType === TYPE_GREY;

	checkHeader(header);

	offset += header.idLength;
	if (offset >= data.length) {
		throw new Error('No data');
	}

	// Read palette
	let palette: Uint8Array
	if (header.hasColorMap) {
		const colorMapSize = header.colorMapLength * (header.colorMapDepth >> 3);
		palette = data.subarray(offset, offset + colorMapSize);
		offset += colorMapSize;
	}

	const pixelSize = header.pixelDepth >> 3;
	const imageSize = header.width * header.height;
	const pixelTotal = imageSize * pixelSize;

	let colorData: Uint8Array;
	if (header.hasEncoding) {
		colorData = decodeRLE(data, offset, pixelSize, pixelTotal);
	} else {
		colorData = data.subarray(
			offset,
			offset + (header.hasColorMap ? imageSize : pixelTotal)
		);
	}

	const imageData = new ImageData(header.width, header.height);
	const origin = (header.flags & ORIGIN_MASK) >> ORIGIN_SHIFT;

	let x_start: number, x_step: number, x_end: number, y_start: number, y_step: number, y_end: number;
	if (origin === ORIGIN_TOP_LEFT || origin === ORIGIN_TOP_RIGHT) {
		y_start = 0;
		y_step = 1;
		y_end = header.height;
	} else {
		y_start = header.height - 1;
		y_step = -1;
		y_end = -1;
	}

	if (origin === ORIGIN_TOP_LEFT || origin === ORIGIN_BOTTOM_LEFT) {
		x_start = 0;
		x_step = 1;
		x_end = header.width;
	} else {
		x_start = header.width - 1;
		x_step = -1;
		x_end = -1;
	}

	switch (header.pixelDepth) {
		case 8:
			header.isGreyColor
				? getImageDataGrey8bits(imageData.data, colorData, header.width, y_start, y_step, y_end, x_start, x_step, x_end)
				: getImageData8bits(imageData.data, colorData, palette, header.width, y_start, y_step, y_end, x_start, x_step, x_end);
			break;

		case 16:
			header.isGreyColor
				? getImageDataGrey16bits(imageData.data, colorData, header.width, y_start, y_step, y_end, x_start, x_step, x_end)
				: getImageData16bits(imageData.data, colorData, header.width, y_start, y_step, y_end, x_start, x_step, x_end);
			break;

		case 24:
			getImageData24bits(imageData.data, colorData, header.width, y_start, y_step, y_end, x_start, x_step, x_end);
			break;

		case 32:
			getImageData32bits(imageData.data, colorData, header.width, y_start, y_step, y_end, x_start, x_step, x_end);
			break;
	}

	return imageData;
}

function getImageData32bits(
	imageData: Uint8ClampedArray,
	pixels: Uint8Array,
	width: number,
	y_start: number,
	y_step: number,
	y_end: number,
	x_start: number,
	x_step: number,
	x_end: number
) {
	for (let i = 0, y = y_start; y !== y_end; y += y_step) {
		for (let x = x_start; x !== x_end; x += x_step, i += 4) {
			const index = (x + width * y) << 2;
			imageData[index + 2] = pixels[i];
			imageData[index + 1] = pixels[i + 1];
			imageData[index] = pixels[i + 2];
			imageData[index + 3] = pixels[i + 3];
		}
	}

	return imageData;
}

function getImageData24bits(
	imageData: Uint8ClampedArray,
	pixels: Uint8Array,
	width: number,
	y_start: number,
	y_step: number,
	y_end: number,
	x_start: number,
	x_step: number,
	x_end: number
) {
	for (let i = 0, y = y_start; y !== y_end; y += y_step) {
		for (let x = x_start; x !== x_end; x += x_step, i += 3) {
			const index = (x + width * y) << 2;
			imageData[index + 3] = 255;
			imageData[index + 2] = pixels[i + 0];
			imageData[index + 1] = pixels[i + 1];
			imageData[index] = pixels[i + 2];
		}
	}

	return imageData;
}

function getImageData16bits(
	imageData: Uint8ClampedArray,
	pixels: Uint8Array,
	width: number,
	y_start: number,
	y_step: number,
	y_end: number,
	x_start: number,
	x_step: number,
	x_end: number
) {
	for (let i = 0, y = y_start; y !== y_end; y += y_step) {
		for (let x = x_start; x !== x_end; x += x_step, i += 2) {
			const color = pixels[i] | (pixels[i + 1] << 8);
			const index = (x + width * y) << 2;
			imageData[index] = (color & 0x7c00) >> 7;
			imageData[index + 1] = (color & 0x03e0) >> 2;
			imageData[index + 2] = (color & 0x001f) >> 3;
			imageData[index + 3] = color & 0x8000 ? 0 : 255;
		}
	}

	return imageData;
}

function getImageDataGrey16bits(
	imageData: Uint8ClampedArray,
	pixels: Uint8Array,
	width: number,
	y_start: number,
	y_step: number,
	y_end: number,
	x_start: number,
	x_step: number,
	x_end: number
) {
	for (let i = 0, y = y_start; y !== y_end; y += y_step) {
		for (let x = x_start; x !== x_end; x += x_step, i += 2) {
			const index = (x + width * y) << 2;
			imageData[index] = pixels[i];
			imageData[index + 1] = pixels[i];
			imageData[index + 2] = pixels[i];
			imageData[index + 3] = pixels[i + 1];
		}
	}

	return imageData;
}

function getImageData8bits(
	imageData: Uint8ClampedArray,
	pixels: Uint8Array,
	colormap: Uint8Array,
	width: number,
	y_start: number,
	y_step: number,
	y_end: number,
	x_start: number,
	x_step: number,
	x_end: number
) {
	for (let i = 0, y = y_start; y !== y_end; y += y_step) {
		for (let x = x_start; x !== x_end; x += x_step, i++) {
			const color = pixels[i] * 3;
			const index = (x + width * y) << 2;
			imageData[index + 3] = 255;
			imageData[index + 2] = colormap[color + 0];
			imageData[index + 1] = colormap[color + 1];
			imageData[index] = colormap[color + 2];
		}
	}

	return imageData;
}

function getImageDataGrey8bits(
	imageData: Uint8ClampedArray,
	pixels: Uint8Array,
	width: number,
	y_start: number,
	y_step: number,
	y_end: number,
	x_start: number,
	x_step: number,
	x_end: number
) {
	for (let i = 0, y = y_start; y !== y_end; y += y_step) {
		for (let x = x_start; x !== x_end; x += x_step, i++) {
			const color = pixels[i];
			const index = (x + width * y) << 2;
			imageData[index] = color;
			imageData[index + 1] = color;
			imageData[index + 2] = color;
			imageData[index + 3] = 255;
		}
	}

	return imageData;
}

function checkHeader(header: TgaHeader) {
	if (header.imageType === TYPE_NO_DATA) {
		throw new Error('No data');
	}

	if (header.hasColorMap) {
		if (
			header.colorMapLength > 256 ||
			header.colorMapDepth !== 24 ||
			header.colorMapType !== 1
		) {
			throw new Error('Invalid colormap for indexed type');
		}
	} else {
		if (header.colorMapType) {
			throw new Error('Why does the image contain a palette ?');
		}
	}
	if (!header.width || !header.height) {
		throw new Error('Invalid image size');
	}

	if (
		header.pixelDepth !== 8 &&
		header.pixelDepth !== 16 &&
		header.pixelDepth !== 24 &&
		header.pixelDepth !== 32
	) {
		throw new Error('Invalid pixel size "' + header.pixelDepth + '"');
	}
}

function decodeRLE(data: Uint8Array, offset: number, pixelSize: number, outputSize: number) {
	const output = new Uint8Array(outputSize);
	const pixels = new Uint8Array(pixelSize);
	let pos = 0;

	while (pos < outputSize) {
		const c = data[offset++];
		let count = (c & 0x7f) + 1;

		// RLE pixels.
		if (c & 0x80) {
			// Bind pixel tmp array
			for (let i = 0; i < pixelSize; ++i) {
				pixels[i] = data[offset + i];
			}

			offset += pixelSize;

			// Copy pixel array
			for (let i = 0; i < count; ++i) {
				output.set(pixels, pos);
				pos += pixelSize;
			}
		}

		// Raw pixels.
		else {
			count *= pixelSize;

			for (let i = 0; i < count; ++i) {
				output[pos + i] = data[offset + i];
			}

			pos += count;
			offset += count;
		}
	}

	return output;
}
