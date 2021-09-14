import { BlendableBehavior } from "./behavior"
import { Vec } from "../util/vec";
import { Entity } from "../entities/entity";

export class SeekTarget extends BlendableBehavior {

	private _target = new Vec();
	public get target() { return this._target.clone(); }
	public set target(target: Vec) { this._target.set(target); }
		
	public constructor(target: Vec, strength: number) {
		super(strength);
		this.target = target;
	}
		
	public apply(boid: Entity) {
		let desired: Vec;
		if (boid.pos.dist(this._target) < 1.5) {
			desired = Vec.invert(boid.vel);
		} else {
			desired = Vec.sub(this._target, boid.pos)
				.sub(boid.vel)
				.normalize()
				.mult(this.strength);
		}
		boid.accelerate(desired);
	}

}
