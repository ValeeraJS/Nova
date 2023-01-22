import { Loader } from "./Loader";

export enum LoadType {
    JSON = 'json',
    BLOB = 'blob',
    TEXT = 'text',
    ARRAY_BUFFER = "arrayBuffer"
}

export type LoadPartType = Blob | string | { [key: string]: any } | ArrayBuffer;

export interface ILoadPart {
    url: string;
    type?: LoadType;
    retryTimes?: number;
    onCancel?: () => void;
    onLoad?: (data: LoadPartType) => any;
    onLoadError?: (e: Error) => any;
    onProgress?: (current: number, total: number, delta: number) => any;
}

export interface ILoadItem<T> {
    type: string;
    name: string;
    loadParts: ILoadPart[];
    onCancel?: () => void;
    onLoad?: () => any;
    onLoadError?: (e: any) => any;
    onParse?: (obj: T) => any;
    onParseError?: (e: any) => any;
    onProgress?: (loaded: number, total: number) => any;
}

export type IParser<T> = (loader: Loader, resource: ILoadItem<any>, ...args: any[]) => T;
