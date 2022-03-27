import Geometry3 from "../Geometry3";
import { IGeometryOptions } from "./geometryOptions";
export declare type IPlaneGeometryOptions = {
    segmentX: number;
    segmentY: number;
} & IGeometryOptions;
export declare const DEFAULT_PLANE_OPTIONS: IPlaneGeometryOptions;
declare const _default: (width?: number, height?: number, options?: IPlaneGeometryOptions) => Geometry3;
export default _default;
