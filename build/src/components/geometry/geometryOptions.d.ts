/// <reference types="dist" />
export type IGeometryOptions = {
    hasNormal?: boolean;
    hasUV?: boolean;
    hasIndices?: boolean;
    combine: boolean;
    topology: GPUPrimitiveTopology;
    cullMode: GPUCullMode;
};
export declare const DEFAULT_OPTIONS: IGeometryOptions;
