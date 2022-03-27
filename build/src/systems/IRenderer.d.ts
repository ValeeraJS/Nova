import IEngine from "../engine/IEngine";
export default interface IWebGLRenderer {
    engine: IEngine;
    renderTypes: string | string[];
}
