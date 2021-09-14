
import { Behavior } from "../behaviors/behavior";
import { Vec } from "../util/vec";
import { Drawable } from "../ui/drawable";

export abstract class Entity implements Drawable {

	public vel = new Vec();
	public rotation = 0;

	public acceleration = new Vec(0, 0);
	public deltaRotation = 0;

	private behaviors: Behavior[] = [];

	public constructor (public pos: Vec) {}

	abstract clone(): Entity;
	public abstract draw(g: CanvasRenderingContext2D, dt: number): void;

	public applyDeltas() {
		this.rotation += this.deltaRotation;
		this.deltaRotation = 0;

		if (this.rotation > Math.PI) {
			this.rotation -= Math.PI * 2;
		} else if (this.rotation <= -Math.PI) {
			this.rotation += Math.PI * 2;
		}

		this.vel.add(this.acceleration);
		this.acceleration.mult(0);

		this.pos.add(this.vel);
	}

	/** For progressively adjusting deltas */
	public rotate(rotation: number) { this.deltaRotation += rotation; }
	public accelerate(acceleration: Vec) { this.acceleration.add(acceleration); }

	public setBehaviors(...behaviors: Behavior[]): Entity {
		this.behaviors = behaviors;
		return this;
	}

	public addBehavior(behavior: Behavior) {
		this.behaviors.push(behavior);
	}

	public applyBehaviors(dt: number) {
		this.behaviors.forEach(b => b.apply(this, dt));
	}

}