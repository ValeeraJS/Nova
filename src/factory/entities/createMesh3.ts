import { IWorld } from "@valeera/x";
import { Geometry } from "../../components";
import { MESH3 } from "../../components/constants";
import { DEFAULT_MATERIAL3 } from "../../components/material/defaultMaterial";
import IMaterial from "../../components/material/IMatrial";
import Object3 from "../../entities/Object3";
import { Mesh3 } from "../../systems/render/webgpu/Mesh3";

export default (geometry: Geometry, material: IMaterial = DEFAULT_MATERIAL3, name = MESH3, world?: IWorld): Object3 => {
    const entity = new Object3(name);
    entity.addComponent(new Mesh3(geometry, material));

    if (world) {
        world.addEntity(entity);
    }
    return entity;
}
