export interface IShaderProgram {
    descriptor: GPUShaderModuleDescriptor;
    name?: string;
    dirty: boolean;
    entryPoint?: string;
}
export declare class ShaderProgram implements IShaderProgram {
    descriptor: {
        code: string;
    };
    name: string;
    dirty: boolean;
    entryPoint: string;
    constructor(code: string, name?: string);
    get code(): string;
    set code(value: string);
}
