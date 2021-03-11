export default interface IEngine {
	init(adapter: GPUAdapter, device: GPUDevice, contex: GPUCanvasContext): this;
}
