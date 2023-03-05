import { ITriangle3 } from "@valeera/mathx";
import { Geometry } from "../Geometry";
import { IGeometryOptions } from "../geometryOptions";
export declare const createTriangle: (t?: ITriangle3, options?: IGeometryOptions, topology?: GPUPrimitiveTopology, cullMode?: GPUCullMode) => Geometry;
