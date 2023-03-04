import { Sampler, ImageBitmapTexture } from "../../texture";
import { IMaterial } from "../../IMatrial";
import Material from "./Material";
export default class ShadertoyMaterial extends Material implements IMaterial {
    private dataD;
    constructor(fs: string, sampler?: Sampler);
    get sampler(): Sampler;
    set sampler(sampler: Sampler);
    get texture0(): ImageBitmapTexture;
    set texture0(texture: ImageBitmapTexture);
    get texture1(): ImageBitmapTexture;
    set texture1(texture: ImageBitmapTexture);
    get texture2(): ImageBitmapTexture;
    set texture2(texture: ImageBitmapTexture);
    get texture3(): ImageBitmapTexture;
    set texture3(texture: ImageBitmapTexture);
    get time(): number;
    set time(time: number);
    get mouse(): ArrayLike<number>;
    set mouse(mouse: ArrayLike<number>);
    get date(): Date;
    set date(d: Date);
}
