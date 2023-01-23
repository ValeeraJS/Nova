import Texture from "../../components/texture/Texture";
import { ILoadItem, IParser } from "../IResourceItem";
import { Loader } from "../Loader";

export const TextureParser: IParser<Texture> = async (loader: Loader, resource: ILoadItem<any>, blob: Blob) => {
    const bitmap = await createImageBitmap(blob);
    return new Texture(bitmap.width, bitmap.height, bitmap);
}
