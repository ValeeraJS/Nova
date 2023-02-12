import { Sampler } from "../../systems/render/texture/Sampler";
import { Texture } from "../../systems/render/texture/Texture";
import IMaterial from "./IMatrial";
import Material from "./Material";
export default class TextureMaterial extends Material implements IMaterial {
    constructor(texture: Texture, sampler?: Sampler);
    get sampler(): Sampler;
    set sampler(sampler: Sampler);
    get texture(): Texture;
    set texture(texture: Texture);
    setTextureAndSampler(texture: Texture, sampler?: Sampler): this;
}
