import { World } from "@valeera/x";
import { SPRITE3 } from "../../components/constants";
import { Object3 } from "../../entities/Object3";
import { Sprite3 } from "../../systems/render/Sprite3";
import { Texture } from "../../systems/render/texture/Texture";

export const createSprite3 = (texture: Texture, name = SPRITE3 , world?: World): Object3 => {
    const entity = new Object3(name);
    entity.addComponent(new Sprite3(texture));

    if (world) {
        world.addEntity(entity);
    }
    return entity;
}
