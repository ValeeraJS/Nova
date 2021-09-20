export type IGeometryOptions = {
    hasNormal?: boolean;
    hasUV?: boolean;
    hasIndices?: boolean;
    combine: boolean;
    topology: GPUPrimitiveTopology;
    cullMode: GPUCullMode;
}

export const DEFAULT_OPTIONS: IGeometryOptions = {
    hasNormal: true,
    hasUV: true,
    hasIndices: false,
    combine: true,
    topology: "triangle-list",
    cullMode: "none"
}
