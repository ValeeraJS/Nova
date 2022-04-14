import Geometry3 from "../Geometry3";
import { IGeometryOptions } from "./geometryOptions";
export declare type ISphereGeometryOptions = {
    radius: number;
    widthSegments: number;
    heightSegments: number;
    phiStart: number;
    phiLength: number;
    thetaStart: number;
    thetaLength: number;
} & IGeometryOptions;
export declare const DEFAULT_SPHERE_OPTIONS: ISphereGeometryOptions;
declare const _default: (options?: ISphereGeometryOptions) => Geometry3;
export default _default;
