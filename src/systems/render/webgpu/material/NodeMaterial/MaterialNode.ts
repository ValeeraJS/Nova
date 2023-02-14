export enum MaterialNodeType {
    Uniform = "Uniform",
    Attribute = "Attribute",
    Command = "Command",
    Vertex = "Vertex",
    Fragment = "Fragment",
    Custom = "Custom",
}

export enum MaterialNodeDataType {
    Float32 = "f32",
    Uint32 = "u32",
    Unt32 = "i32",
    Vector2Float32 = "vec2<f32>",
    Vector3Float32 = "vec3<f32>",
    Vector4Float32 = "vec4<f32>",
    Boolean = "bool",
}

export interface IMaterialNode {
    name: string;
    comments?: string;
    type: MaterialNodeType;
}

export interface IHasExportMaterialNode<T> extends IMaterialNode {
    output: MaterialNodeOutput<T>;
}

export interface IHasImportMaterialNode extends IMaterialNode {
    imports: {
        [KEY: string]: IHasExportMaterialNode<any>
    }
}

export interface IHasImportOutputMaterialNode<T> extends IMaterialNode {
    imports: {
        [KEY: string]: IHasExportMaterialNode<any>
    };
    output: MaterialNodeOutput<T>;
}

export interface MaterialNodeOutput<T> {
    comments?: string;
    value: T;
    dataType: MaterialNodeDataType;
}

export class MaterialNode implements IMaterialNode {
    name: string;
    comments: string;
    type: MaterialNodeType = MaterialNodeType.Custom;
    dirty: boolean = false;

    constructor(name: string = "Untitled Node", comments: string = "") {
        this.name = name;
        this.comments = comments;
    }
}
