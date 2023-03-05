import { Geometry } from "../Geometry";
import { IGeometryOptions } from "../geometryOptions";
export type ICircleGeometryOptions = {
    segments: number;
    angleStart: number;
    angle: number;
    radius: number;
} & IGeometryOptions;
export type ICircleGeometryOptionsInput = Partial<ICircleGeometryOptions>;
export declare const DEFAULT_CIRCLE_OPTIONS: ICircleGeometryOptions;
export declare const createCircle: (options?: ICircleGeometryOptionsInput) => Geometry;
