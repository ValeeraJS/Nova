export interface IUniformSlot {
    name: string;
    value: any;
    binding: number;
    dirty: boolean;
    type: string;
    buffer?: any;
}

export interface IShaderProgram {
    descriptor: GPUShaderModuleDescriptor ;
    name?: string;
    dirty: boolean;
}

export interface IMaterial {
    vertexShader: IShaderProgram;
    fragmentShader: IShaderProgram;
    uniforms: IUniformSlot[];
    blend: GPUBlendState;
    dirty: boolean;
}
