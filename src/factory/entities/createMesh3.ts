import IComponent from "@valeera/x/src/interfaces/IComponent";
import IEntity from "@valeera/x/src/interfaces/IEntity";
import IWorld from "@valeera/x/src/interfaces/IWorld";
import { MESH3 } from "../../components/constants";
import { DEFAULT_MATERIAL3 } from "../../components/material/defaultMaterial";
import IMaterial from "../../components/material/IMatrial";
import { Renderable } from "../../components/tag";
import Object3 from "../../entities/Object3";

export default (geometry: IComponent<any>, material: IMaterial = DEFAULT_MATERIAL3, name = MESH3, world?: IWorld): IEntity => {
    const entity = new Object3(name);
    entity.addComponent(geometry)
        .addComponent(material)
        .addComponent(new Renderable(MESH3));

    if (world) {
        world.addEntity(entity);
    }
    return entity;
}
