import { Geometry } from "../Geometry";
import { IGeometryOptions } from "../geometryOptions";
export type IPlaneGeometryOptions = {
    width: number;
    height: number;
    segmentX: number;
    segmentY: number;
} & IGeometryOptions;
export type IPlaneGeometryOptionsInput = Partial<IPlaneGeometryOptions>;
export declare const DEFAULT_PLANE_OPTIONS: IPlaneGeometryOptions;
export declare const createPlane: (options?: IPlaneGeometryOptionsInput) => Geometry;
