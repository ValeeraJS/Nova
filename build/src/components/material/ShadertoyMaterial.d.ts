import ImageBitmapTexture from "../texture/ImageBitmapTexture";
import Sampler from "../texture/Sampler";
import IMaterial from "./IMatrial";
import Material from "./Material";
export default class ShadertoyMaterial extends Material implements IMaterial {
    private dataD;
    constructor(fs: string, texture: ImageBitmapTexture, sampler?: Sampler);
    get sampler(): Sampler;
    set sampler(sampler: Sampler);
    get texture(): ImageBitmapTexture;
    set texture(texture: ImageBitmapTexture);
    get time(): number;
    set time(time: number);
    get mouse(): ArrayLike<number>;
    set mouse(mouse: ArrayLike<number>);
    get date(): Date;
    set date(d: Date);
}
