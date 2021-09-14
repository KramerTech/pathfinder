import { Entity } from "./entity";
import { Util } from "../util/util";
import { Vec } from "../util/vec";

export class Boid extends Entity {

	public static DEFAULT_SIZE = 6;

	private diameter: number;
	private tx: number;
	private ty: number;

	public constructor (
		pos = new Vec(),
		public radius = Boid.DEFAULT_SIZE,
		public color = "black",
	) {
		super(pos);
		this.diameter = this.radius * 2;
		this.tx = this.radius * Math.cos(Util.radians(60));
		this.ty = this.radius * Math.sin(Util.radians(60));
	}

	public draw(g: CanvasRenderingContext2D) {
		g.fillStyle = this.color;
		g.beginPath();
		g.ellipse(0, 0, this.radius, this.radius, 0, 0, Math.PI * 2);
		g.rotate(this.rotation);
		g.moveTo(this.tx, -this.ty);
		g.lineTo(this.diameter, 0);
		g.lineTo(this.tx, this.ty);
		g.fill();
	}

	public clone(): Entity {
		const clone = new Boid(this.pos.clone(), this.radius, this.color);
		clone.rotation = this.rotation;
		return clone;
	}

	public setPosition(pos: Vec) {
		this.pos.set(pos);
		this.vel.zero();
	}

}
