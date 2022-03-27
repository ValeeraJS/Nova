/// <reference types="dist" />
import ITriangle from "@valeera/mathx/src/shape/interfaces/ITriangle";
import Geometry3 from "../Geometry3";
import { IGeometryOptions } from "./geometryOptions";
declare const _default: (t?: ITriangle, options?: IGeometryOptions, topology?: GPUPrimitiveTopology, cullMode?: GPUCullMode) => Geometry3;
export default _default;
