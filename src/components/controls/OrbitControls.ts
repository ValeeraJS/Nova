import { clamp, Matrix4, Spherical, Vector2, Vector3 } from "@valeera/mathx";
import { Component, ComponentManager } from "@valeera/x";
import { Object3 } from "../../entities/Object3";

export class OrbitControls extends Component<any> {
    speedTheta: number = -0.005;
    speedPhi: number = -0.005;
    speedZoom: number = 0.005;
    minDistance: number = 0.1;
    maxDistance: number = Infinity;
    minPolarAngle: number = (1 / 180) * Math.PI;
    maxPolarAngle: number = (179 / 180) * Math.PI;
    disabled = false;
    spherical: Spherical = new Spherical(5, 0, Math.PI * 0.5);
    dom: HTMLElement;
    target: Vector3;
    constructor(target: Vector3 = Vector3.VECTOR3_ZERO, dom: HTMLElement = document.body) {
        super(target, undefined, 'orbitcontrols');
        this.dom = dom;
        this.target = target;
        this.addEvent();
    }

    isDown = false;
    screenPositionOld = new Vector2();
    screenPositionNew = new Vector2();
    positionDelta = new Vector2();
    innerPosition = new Vector3();
    addEvent() {
        this.dom.addEventListener('pointerdown', (e) => {
            if (this.disabled) {
                return;
            }
            this.isDown = true;
            this.screenPositionNew.x = e.offsetX;
            this.screenPositionNew.y = e.offsetY;
        });

        this.dom.addEventListener('pointerup', (e) => {
            if (this.disabled) {
                return;
            }
            this.isDown = false;
            this.screenPositionNew.x = e.offsetX;
            this.screenPositionNew.y = e.offsetY;
        });

        this.dom.addEventListener('pointermove', (e) => {
            if (this.disabled || !this.isDown) {
                return;
            }
            this.screenPositionOld.set(this.screenPositionNew);
            Vector2.fromXY(e.offsetX, e.offsetY, this.screenPositionNew);
            Vector2.minus(this.screenPositionNew, this.screenPositionOld, this.positionDelta);
            this.spherical.theta += this.positionDelta.y * this.speedPhi;
            this.spherical.phi += this.positionDelta.x * this.speedTheta;
            this.spherical.theta = clamp(this.spherical.theta, this.minPolarAngle, this.maxPolarAngle);
            this.dirty = true;
        });

        this.dom.addEventListener('wheel', (e) => {
            if (this.disabled) {
                return;
            }

            this.spherical.radius += e.deltaY * this.speedZoom;
            this.spherical.radius = clamp(this.spherical.radius, this.minDistance, this.maxDistance);
            this.dirty = true;
        });
    }

    update() {
        if (this.disabled || !this.dirty) {
            return;
        }
        this.dirty = false;
        this.spherical.toVector3(this.innerPosition);
        for (let manager of this.usedBy) {
            const entity = manager.usedBy as Object3;
            const position = entity.position;
            Matrix4.fromTranslation(this.innerPosition, position.data);
            position.dirty = true;
            const rotation = entity.rotation;
            Matrix4.targetTo(
                this.innerPosition,
                this.target,
                Vector3.VECTOR3_TOP,
                rotation.data
            );
            rotation.dirty = true;
        }
    }
}
