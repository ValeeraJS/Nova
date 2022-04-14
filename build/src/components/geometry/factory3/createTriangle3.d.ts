/// <reference types="dist" />
import { ITriangle3 } from "@valeera/mathx";
import Geometry3 from "../Geometry3";
import { IGeometryOptions } from "./geometryOptions";
declare const _default: (t?: ITriangle3, options?: IGeometryOptions, topology?: GPUPrimitiveTopology, cullMode?: GPUCullMode) => Geometry3;
export default _default;
