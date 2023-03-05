import { Geometry } from "../Geometry";
import { IGeometryOptions } from "../geometryOptions";
export type ICylinderGeometryOptions = {
    radiusTop: number;
    radiusBottom: number;
    height: number;
    radialSegments: number;
    heightSegments: number;
    openEnded: boolean;
    thetaStart: number;
    thetaLength: number;
} & IGeometryOptions;
export type ICylinderGeometryOptionsInput = Partial<ICylinderGeometryOptions>;
export declare const DEFAULT_CYLINDER_OPTIONS: ICylinderGeometryOptions;
export declare const createCylinder: (options?: ICylinderGeometryOptionsInput) => Geometry;
