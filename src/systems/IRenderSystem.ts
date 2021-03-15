import ISystem from "@valeera/x/src/interfaces/ISystem";

export default interface IRenderSystem extends ISystem{
	clear(): this;
	render(): this;
	end(): this;
}
