import IComponent from "@valeera/x/src/interfaces/IComponent";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import IWorld from "@valeera/x/src/interfaces/IWorld";
import { DEFAULT_MATERIAL } from "../../components/constants";
import IMaterial from "../../components/material/IMatrial";
import { Renderable } from "../../components/tag";
import Object3 from "../../entities/Object3";

export default (geometry: IComponent<any>, material: IMaterial = DEFAULT_MATERIAL, name = "mesh", world?: IWorld): IEntity => {
    const entity = new Object3(name) as any;
    entity.addComponent(geometry)
        .addComponent(material)
        .addComponent(new Renderable("mesh"));

    if (world) {
        world.addEntity(entity);
    }
    return entity;
}
