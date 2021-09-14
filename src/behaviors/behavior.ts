import { Entity } from "../entities/entity";

export abstract class Behavior {

	protected subBehaviors: Behavior[] = [];

	protected addSubBehavior(behavior: Behavior) {
		this.subBehaviors.push(behavior);
	}

	protected applySubBehaviors(boid: Entity, dt: number) {
		this.subBehaviors.forEach(b => b.apply(boid, dt));
	}

	public abstract apply(boid: Entity, dt: number): void;

}

export abstract class BlendableBehavior extends Behavior {

	public constructor(private _strength = 1) {
		super();
		this.setStrength(_strength);
	}

	public setStrength(strength: number) {
		this._strength = strength;
		if (!this.subBehaviors) { return; }
		this.subBehaviors.forEach(b => {
			if (b instanceof BlendableBehavior) {
				b.setStrength(strength);
			}
		})
	}

	public get strength() { return this._strength };

}