import Geometry3 from "../Geometry3";
import { IGeometryOptions } from "./geometryOptions";
export declare type ICylinderGeometryOptions = {
    radiusTop: number;
    radiusBottom: number;
    height: number;
    radialSegments: number;
    heightSegments: number;
    openEnded: boolean;
    thetaStart: number;
    thetaLength: number;
} & IGeometryOptions;
export declare const DEFAULT_SPHERE_OPTIONS: ICylinderGeometryOptions;
declare const _default: (options?: ICylinderGeometryOptions) => Geometry3;
export default _default;
