import Geometry3 from "../Geometry3";
import { IGeometryOptions } from "./geometryOptions";
export declare type IPlaneGeometryOptions = {
    width: number;
    height: number;
    segmentX: number;
    segmentY: number;
} & IGeometryOptions;
export declare type IPlaneGeometryOptionsInput = Partial<IPlaneGeometryOptions>;
export declare const DEFAULT_PLANE_OPTIONS: IPlaneGeometryOptions;
declare const _default: (options?: IPlaneGeometryOptionsInput) => Geometry3;
export default _default;
