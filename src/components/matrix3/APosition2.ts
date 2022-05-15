
import { Matrix3 } from "@valeera/mathx";
import { TRANSLATION_2D } from "../constants";
import Matrix3Component from "./Matrix3Component";

export default abstract class APosition2 extends Matrix3Component {
    constructor(data = Matrix3.create()) {
        super(TRANSLATION_2D, data, [{
			label: TRANSLATION_2D,
			unique: true
		}]);
    }
}
