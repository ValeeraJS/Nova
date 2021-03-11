import IEntity from "@valeera/x/src/interfaces/IEntity";
import IRenderer from "./IRenderer";

export default class MeshRenderer implements IRenderer{
	public readonly renderTypes = "mesh";
	render(mesh: IEntity, camera: IEntity): this {
		return this;
	}
}
