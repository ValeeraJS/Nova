import { IFrame } from "../systems/render/texture/spritesheet/IFrame";

const canvases: HTMLCanvasElement[] = []; // 储存多个canvas，可能存在n个图同时画

export async function drawSpriteBlock(image: HTMLImageElement | ImageBitmap, width: number, height: number, frame: IFrame): Promise<ImageBitmap> {
    let canvas = canvases.pop() || document.createElement("canvas");
    let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h, frame.dx, frame.dy, frame.w, frame.h);
    let result = await createImageBitmap(canvas);
    canvases.push(canvas);

    return result;
}
