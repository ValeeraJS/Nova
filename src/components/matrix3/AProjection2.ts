
import { Matrix3 } from "@valeera/mathx";
import { PROJECTION_2D } from "../constants";
import Matrix3Component from "./Matrix3Component";

export default abstract class AProjection2 extends Matrix3Component {
    constructor(data = Matrix3.create()) {
        super(PROJECTION_2D, data, [{
			label: PROJECTION_2D,
			unique: true
		}]);
    }
}
