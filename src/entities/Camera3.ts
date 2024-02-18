import AProjection3 from "../components/matrix4/AProjection3";
import PerspectiveProjection from "../components/matrix4/PerspectiveProjection";
import { Object3, IObject3 } from "./Object3";

export interface ICamera3 extends IObject3 {
	projection: AProjection3;
}

export class Camera3 extends Object3 implements ICamera3 {
	projection: AProjection3;
	constructor(projection: AProjection3 = new PerspectiveProjection(), name: string = "Camera3") {
		super(name);
		this.projection = projection;
	}
}
