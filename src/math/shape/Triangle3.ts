import ITriangle3 from "./interfaces/ITriangle";
import { IVector3Data } from "../vector/interfaces/IVector3";
import Vector3, { minus as minusVec3, cross as crossVec3, normalize as normalizeVec3} from "../vector/Vector3";

let ab: IVector3Data, bc: IVector3Data, ca: IVector3Data;

export default class Triangle3 implements ITriangle3 {
    a: IVector3Data;
    b: IVector3Data;
    c: IVector3Data;

    constructor(a: IVector3Data, b: IVector3Data, c: IVector3Data) {
        this.a = a;
        this.b = b;
        this.c = c;
    }
}

export const normal = (t: ITriangle3, out: IVector3Data = new Vector3) => {

    minusVec3(t.c, t.b, bc);
    minusVec3(t.b, t.a, ab);

    crossVec3(ab, bc, out);
    return normalizeVec3(out);
}
