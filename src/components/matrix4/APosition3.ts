
import { Matrix4 } from "@valeera/mathx";
import { TRANSLATION_3D } from "./constants";
import Matrix4Component from "./Matrix4Component";

export default abstract class APosition3 extends Matrix4Component {
    constructor(data = Matrix4.create()) {
        super(TRANSLATION_3D, data);
    }
}
