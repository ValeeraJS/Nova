import Component from "@valeera/x/src/Component";

export default class Renderable extends Component<string> {
    public static readonly TAG_TEXT = "Renderable";
    public tags = [{
        label: "Renderable",
        unique: true
    }];
    constructor(renderType: string) {
        super(Renderable.TAG_TEXT, renderType);
    }
}
