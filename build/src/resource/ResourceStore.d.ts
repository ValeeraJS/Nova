import EventFirer from "@valeera/eventfirer";
import { ILoadItem, IParser, LoadPartType, LoadType } from "./IResourceItem";
export declare class ResourceStore extends EventFirer {
    #private;
    static readonly WILL_LOAD = "willLoad";
    static readonly LOADING = "loading";
    static readonly LOADED = "loaded";
    static readonly PARSED = "parsed";
    resourcesMap: Map<string, Map<string, any>>;
    loadItems: {
        text: Map<string, string>;
        json: Map<string, {
            [key: string]: any;
        }>;
        arrayBuffer: Map<string, ArrayBuffer>;
        blob: Map<string, Blob>;
    };
    parsers: Map<string, IParser<any>>;
    maxTasks: number;
    getResource(name: string, type: string): any;
    setResource(data: any, type: string, name: string): this;
    loadAndParse: (arr: ILoadItem<LoadPartType>[]) => void;
    getUrlLoaded(url: string, type?: LoadType): LoadPartType | null;
    registerParser(parser: IParser<any>, type: string): this;
}
