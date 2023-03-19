import { IParser } from "../IResourceItem";
import { Texture } from "../../systems/render/texture/Texture";

export const AtlasParser: IParser<Texture[]> = async (blob: Blob) => {
    const bitmap = await createImageBitmap(blob);
	const result: Texture[] = [];
	
    return result;
}
