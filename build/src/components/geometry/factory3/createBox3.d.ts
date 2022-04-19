import Geometry3 from "../Geometry3";
import { IGeometryOptions } from "./geometryOptions";
export declare type IBoxGeometryOptions = {
    width: number;
    height: number;
    depth: number;
    widthSegments: number;
    heightSegments: number;
    depthSegments: number;
} & IGeometryOptions;
export declare const DEFAULT_BOX_OPTIONS: IBoxGeometryOptions;
export declare type IBoxGeometryOptionsInput = Partial<IBoxGeometryOptions>;
declare const _default: (options?: IBoxGeometryOptionsInput) => Geometry3;
export default _default;
