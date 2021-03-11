import Entity from "@valeera/x/src/Entity";
import EuclidPosition3 from "../components/matrix4/EuclidPosition3";
import EulerRotation3 from "../components/matrix4/EulerRotation3";
import Matrix4Component from "../components/matrix4/Matrix4Component";

export default class Camera extends Entity {
	public constructor(projection: Matrix4Component, name = "camera") {
		super(name);
		this.addComponent(projection);
		this.addComponent(new EuclidPosition3());
		this.addComponent(new EulerRotation3());
	}
}
