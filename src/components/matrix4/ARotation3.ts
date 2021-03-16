import { Matrix4 } from "@valeera/mathx";
import { ROTATION_3D } from "../constants";
import Matrix4Component from "./Matrix4Component";

export default abstract class ARotation3 extends Matrix4Component {
    constructor(data = Matrix4.create()) {
        super(ROTATION_3D, data);
    }
}
