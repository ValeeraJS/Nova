import { Constants } from "@valeera/mathx";
import { IFrame } from "../systems/render/texture/spritesheet/IFrame";

const canvases: HTMLCanvasElement[] = []; // 储存多个canvas，可能存在n个图同时画

export async function drawSpriteBlock(image: HTMLImageElement | ImageBitmap, width: number, height: number, frame: IFrame): Promise<ImageBitmap> {
	const canvas = canvases.pop() || document.createElement("canvas");
	const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
	canvas.width = width;
	canvas.height = height;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (frame.rotation) {
		ctx.rotate(-Constants.DEG_90_RAD);
		ctx.translate(-frame.w, 0);
	}
	ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h, frame.dx ?? 0, frame.dy ?? 0, frame.w, frame.h);
	const result = await createImageBitmap(canvas);
	canvases.push(canvas);

	if (frame.rotation) {
		ctx.translate(frame.w, 0, );
		ctx.rotate(Constants.DEG_90_RAD);
	}

	return result;
}
