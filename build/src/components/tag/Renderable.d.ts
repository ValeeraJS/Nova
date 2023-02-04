import { Component } from "@valeera/x";
export default class Renderable extends Component<string> {
    tags: {
        label: string;
        unique: boolean;
    }[];
    constructor(renderType: string);
}
