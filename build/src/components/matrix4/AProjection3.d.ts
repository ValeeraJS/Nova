import { Matrix4 } from "@valeera/mathx";
import Matrix4Component from "./Matrix4Component";
export default abstract class AProjection3 extends Matrix4Component {
    inverseMatrix: Float32Array;
    constructor(data?: Matrix4);
    updateProjectionInverse(): void;
}
