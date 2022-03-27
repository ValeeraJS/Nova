import Geometry3 from "../Geometry3";
import { IGeometryOptions } from "./geometryOptions";
export declare type ICircleGeometryOptions = {
    segments: number;
    angleStart: number;
    angle: number;
    radius: number;
} & IGeometryOptions;
export declare const DEFAULT_CIRCLE_OPTIONS: ICircleGeometryOptions;
declare const _default: (options?: ICircleGeometryOptions) => Geometry3;
export default _default;
