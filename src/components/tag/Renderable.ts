import Component from "@valeera/x/src/Component";
import { RENDERABLE } from "../constants";

export default class Renderable extends Component<string> {
    public tags = [{
        label: RENDERABLE,
        unique: true
    }];
    constructor(renderType: string) {
        super(RENDERABLE, renderType);
    }
}
