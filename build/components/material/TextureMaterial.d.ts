import Sampler from "../texture/Sampler";
import Texture from "../texture/Texture";
import IMaterial, { IShaderCode } from "./IMatrial";
import Material from "./Material";
export default class TextureMaterial extends Material implements IMaterial {
    data: IShaderCode;
    constructor(texture: Texture, sampler?: Sampler);
    get sampler(): Sampler;
    set sampler(sampler: Sampler);
    get texture(): Texture;
    set texture(texture: Texture);
    setTextureAndSampler(texture: Texture, sampler?: Sampler): this;
}
