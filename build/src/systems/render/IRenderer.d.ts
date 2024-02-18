import type { Entity } from "@valeera/x";
export interface IRenderer {
    renderTypes: string | string[];
    render(entity: Entity, ...args: any[]): any;
}
