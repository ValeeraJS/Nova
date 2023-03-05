import { IWorld } from "@valeera/x";
import { MESH3 } from "../../components/constants";
import { Object3 } from "../../entities/Object3";
import { Geometry } from "../../systems/render/geometry/Geometry";
import { IMaterial } from "../../systems/render/webgpu/material";
import { DEFAULT_MATERIAL3 } from "../../systems/render/webgpu/material/defaultMaterial";
import { Mesh3 } from "../../systems/render/Mesh3";

export const createMesh3 = (geometry: Geometry, material: IMaterial = DEFAULT_MATERIAL3, name = MESH3, world?: IWorld): Object3 => {
    const entity = new Object3(name);
    entity.addComponent(new Mesh3(geometry, material));

    if (world) {
        world.addEntity(entity);
    }
    return entity;
}
