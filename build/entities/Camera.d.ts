import Entity from "@valeera/x/src/Entity";
import Matrix4Component from "../components/matrix4/Matrix4Component";
export default class Camera extends Entity {
    constructor(projection: Matrix4Component, name?: string);
}
