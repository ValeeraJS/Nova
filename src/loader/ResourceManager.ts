import { Loader } from "./Loader";

export default class ResourceManager {
    public parsers = new Map<string, Loader>();
}