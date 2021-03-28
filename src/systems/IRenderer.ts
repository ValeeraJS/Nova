import IEntity from "@valeera/x/src/interfaces/IEntity";
import IEngine from "../engine/IEngine";

export default interface IWebGLRenderer {
    engine: IEngine;
    renderTypes: string | string[]; // 某渲染器可渲染的实例渲染标记类型
}
