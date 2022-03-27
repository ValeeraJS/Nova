import Geometry3 from "../Geometry3";
import { IGeometryOptions } from "./geometryOptions";
export declare type ISphereGeometryOptions = {
    segments: number;
    angleStart: number;
    angle: number;
    radius: number;
} & IGeometryOptions;
export declare const DEFAULT_SPHERE_OPTIONS: ISphereGeometryOptions;
declare const _default: (options?: ISphereGeometryOptions) => Geometry3;
export default _default;
