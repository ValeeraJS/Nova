import ISystem from "@valeera/x/src/interfaces/ISystem";
import IRenderer from "./IRenderer";

export default interface IRenderSystem extends ISystem {
	addRenderer(renderer: IRenderer): this;
	setClear(): this;
}
