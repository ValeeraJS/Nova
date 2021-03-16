import Entity from "@valeera/x/src/Entity";
import IComponent from "@valeera/x/src/interfaces/IComponent";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import IWorld from "@valeera/x/src/interfaces/IWorld";
import { Matrix4Component } from "../../components/matrix4";
import { Renderable } from "../../components/tag";
import { MODEL_3D, ROTATION_3D, SCALING_3D, TRANSLATION_3D } from "../../components/constants";

export default (geometry: IComponent<any>, name = "mesh", world?: IWorld): IEntity => {
    const entity = new Entity(name);
    entity.addComponent(geometry)
        .addComponent(new Matrix4Component(TRANSLATION_3D))
        .addComponent(new Matrix4Component(ROTATION_3D))
        .addComponent(new Matrix4Component(SCALING_3D))
        .addComponent(new Matrix4Component(MODEL_3D))
        .addComponent(new Renderable("mesh"));

    if (world) {
        world.addEntity(entity);
    }
    return entity;
}
