import { Behavior } from "./behavior";
import { Entity } from "../entities/entity";
import { Vec } from "../util/vec";

export class CapVelocity extends Behavior {
	protected _cap!: number;
	protected capSq!: number;
	public get cap() { return this._cap; }
	public set cap(cap: number) {
		this._cap = cap;
		this.capSq = cap * cap;
	}
	public constructor(cap = 0) {
		super();
		this.cap = cap;
	}
	public apply(boid: Entity) {
		const targetV = Vec.add(boid.vel, boid.acceleration);
		if (targetV.magSq() > this.capSq) {
			boid.vel.set(targetV.normalize().mult(this._cap));
		}
	}
}

export class CapAcceleration extends CapVelocity {
	public constructor(cap: number) { super(cap); }
	public apply(boid: Entity) {
		if (boid.acceleration.magSq() > this.capSq) {
			boid.acceleration.normalize();
			boid.acceleration.mult(this.cap);
		}
	}
}

export class CapRotation extends Behavior {
	public constructor(public cap = 0) { super(); }
	public apply(boid: Entity) {
		const delta = boid.deltaRotation;
		if (Math.abs(delta) > this.cap) {
			const removeExcess = Math.sign(delta) * this.cap - delta;
			boid.rotate(removeExcess);
		}
	}
}