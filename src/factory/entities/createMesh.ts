import Entity from "@valeera/x/src/Entity";
import IComponent from "@valeera/x/src/interfaces/IComponent";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import IWorld from "@valeera/x/src/interfaces/IWorld";
import { EuclidPosition3, EulerRotation3, Vector3Scale3 } from "../../components/matrix4";
import { Renderable } from "../../components/tag";

export default (geometry: IComponent<any>, name = "mesh", world?: IWorld): IEntity => {
    const entity = new Entity(name);
    entity.addComponent(geometry)
        .addComponent(new EuclidPosition3())
        .addComponent(new Vector3Scale3())
        .addComponent(new EulerRotation3())
        .addComponent(new Renderable("mesh"));

    if (world) {
        world.addEntity(entity);
    }
    return entity;
}
