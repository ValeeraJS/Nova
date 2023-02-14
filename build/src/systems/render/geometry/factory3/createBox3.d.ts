import Geometry from "../Geometry";
import { IGeometryOptions } from "../geometryOptions";
export type IBoxGeometryOptions = {
    width: number;
    height: number;
    depth: number;
    widthSegments: number;
    heightSegments: number;
    depthSegments: number;
} & IGeometryOptions;
export declare const DEFAULT_BOX_OPTIONS: IBoxGeometryOptions;
export type IBoxGeometryOptionsInput = Partial<IBoxGeometryOptions>;
declare const _default: (options?: IBoxGeometryOptionsInput) => Geometry;
export default _default;
