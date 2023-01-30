import ISystem from "@valeera/x/src/interfaces/ISystem";
import { ColorFormatType } from "../utils/getColorGPU";
import { IRenderer } from "./IRenderer";
import IScissor from "./IScissor";
import IViewport from "./IViewport";

export interface IRenderSystemInCanvas extends ISystem {
	canvas: HTMLCanvasElement;
	context: any;
	clearColor: ColorFormatType;
	resolution: number;
	width: number;
	height: number;
	alphaMode: string;
	viewport: IViewport;
	scissor: IScissor;
	addRenderer(renderer: IRenderer): this;
	resize(width: number, height: number, resolution?: number): this;
}

export interface IRenderSystemInCanvasOptions {
	alphaMode?: string;
	autoResize?: boolean;
	clearColor?: ColorFormatType;
	element?: HTMLElement;
	height?: number;
	resolution?: number;
	width?: number;
	noDepthTexture?: boolean;
}

export interface IRenderSystemWebGPUOptions extends IRenderSystemInCanvasOptions{
	multisample?: GPUMultisampleState
}
