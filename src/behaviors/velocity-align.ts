import { Behavior } from "./behavior";
import { Entity } from "../entities/entity";
import { Vec } from "../util/vec";

export class AlignToVelocity extends Behavior {

	public apply(boid: Entity) {
		if (boid.vel.magSq() == 0) { return; }

		const desired = boid.vel.angle();
		let delta = desired - boid.rotation;

		if (delta > Math.PI) {
			delta -= Vec.TWO_PI;
		} else if (delta <= -Math.PI) {
			delta += Vec.TWO_PI;
		}

		boid.rotate(delta);
	}
}
