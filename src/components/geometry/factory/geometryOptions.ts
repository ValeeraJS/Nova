export type geometryOptions = {
    hasNormal?: boolean;
    hasUV?: boolean;
    hasIndices?: boolean;
    combine: boolean;
}

export const DEFAULT_OPTIONS: geometryOptions = {
    hasNormal: false,
    hasUV: false,
    hasIndices: false,
    combine: true
}
