import { IShaderProgram } from "./IMatrial";
export declare class ShaderProgram implements IShaderProgram {
    descriptor: {
        code: string;
    };
    name: string;
    dirty: boolean;
    constructor(code: string, name?: string);
    get code(): string;
    set code(value: string);
}
