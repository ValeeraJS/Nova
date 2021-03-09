import { IColorRGBJson } from "./IColorRGB";
import { IPairs4Uint8 } from "../../common/interfaces/IPairs4";

export interface IColorRGBAData extends IPairs4Uint8 {}

export interface IColorRGBAJson extends IColorRGBJson {
	a: number;
}

export default interface IColorRGBA extends IColorRGBAData, IColorRGBAJson {}
