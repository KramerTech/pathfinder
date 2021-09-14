import { Behavior } from "./behavior";
import { Vec } from "../util/vec";
import { Drawable } from "../ui/drawable";
import { Entity } from "../entities/entity";

export class BreadCrumbs extends Behavior implements Drawable {

	public static BUFFER_DISTANCE = 40;
	public static CRUMB_SCALE = 0.5;

	private distTracker = 0;

	private last?: Vec;
	private crumbs: Entity[] = [];

	public constructor(
		private bufferDist = BreadCrumbs.BUFFER_DISTANCE,
		private max = 20,
		private scale = BreadCrumbs.CRUMB_SCALE,
	) {
		super();
	}

	public clear() { this.crumbs.length = 0; }

	public apply(parent: Entity) {
		if (!this.last) {
			this.last = parent.pos.clone();
			return;
		}
		
		this.distTracker += parent.pos.dist(this.last);
		if (this.distTracker > this.bufferDist) {
			this.crumbs.push(parent.clone());
			this.distTracker -= this.bufferDist;
		}
		this.last.set(parent.pos);

		if (this.max > 0 && this.crumbs.length > this.max) {
			this.crumbs.splice(0, 1);
		}
	}

	public draw(g: CanvasRenderingContext2D, dt: number) {
		// How much to increment alpha by on each crumb
		const inc = 1 / this.max;
		
		// Base alpha for first crumb (useful when < max crumbs)
		let alpha = (this.max - this.crumbs.length) * inc;
		// Adjust alpha gradually as we get nearer to the next crumb
		// so there isn't a stark alpha jump when new crumb inserted
		alpha -= inc * (this.distTracker / this.bufferDist);
		
		this.crumbs.forEach(e => {
			alpha += inc;
			
			g.save();
			g.globalAlpha = alpha;
			g.translate(e.pos.x, e.pos.y);
			g.scale(this.scale, this.scale);
			e.draw(g, dt);
			g.restore();
		});
	}

}