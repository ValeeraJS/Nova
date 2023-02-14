import Geometry from "../Geometry";
import { IGeometryOptions } from "../geometryOptions";
export type ISphereGeometryOptions = {
    radius: number;
    widthSegments: number;
    heightSegments: number;
    phiStart: number;
    phiLength: number;
    thetaStart: number;
    thetaLength: number;
} & IGeometryOptions;
export type ISphereGeometryOptionsInput = Partial<ISphereGeometryOptions>;
export declare const DEFAULT_SPHERE_OPTIONS: ISphereGeometryOptions;
declare const _default: (options?: ISphereGeometryOptionsInput) => Geometry;
export default _default;
