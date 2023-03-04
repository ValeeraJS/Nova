import { IShaderProgram } from "./IMatrial";
export declare class ShaderProgram implements IShaderProgram {
    data: {
        code: string;
        entry: string;
    };
    dirty: boolean;
    constructor(code: string, entry?: string);
    get code(): string;
    set code(value: string);
    get entry(): string;
    set entry(value: string);
}
