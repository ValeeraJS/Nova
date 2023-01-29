import type { IEntity } from "@valeera/x";

export interface IRenderer {
    renderTypes: string | string[];
    render(entity: IEntity, ...args: any[]): any; // 处理渲染逻辑
}
