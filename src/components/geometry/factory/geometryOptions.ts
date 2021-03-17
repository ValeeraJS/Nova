export type geometryOptions = {
    hasNormal?: boolean;
    hasUV?: boolean;
    hasIndices?: boolean;
    combine: boolean;
}

export const DEFAULT_OPTIONS: geometryOptions = {
    hasNormal: true,
    hasUV: true,
    hasIndices: false,
    combine: true
}
