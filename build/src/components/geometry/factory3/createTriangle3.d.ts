/// <reference types="dist" />
import { ITriangle3 } from "@valeera/mathx";
import Geometry from "../Geometry";
import { IGeometryOptions } from "../geometryOptions";
declare const _default: (t?: ITriangle3, options?: IGeometryOptions, topology?: GPUPrimitiveTopology, cullMode?: GPUCullMode) => Geometry;
export default _default;
