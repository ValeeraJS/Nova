type Constructor<T> = new (...args: any[]) => T;

export interface IResourceItem<T> {
    type: Constructor<T>;
    name: string;
    url: string;
    retryTimes?: number;
    onLoad?: () => any;
    onParse?: (obj: T) => any;
    onError?: (e: Error) => any;
}