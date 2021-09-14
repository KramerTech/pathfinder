import { Entity } from "./entities/entity";
import { Drawable, DrawFunction } from "./ui/drawable";

type UpdateCallback = (dt: number) => void;
export class World implements Drawable {

	private callbacks: UpdateCallback[] = [];
	private entities: Entity[] = [];
	private background: Drawable[] = [];
	private foreground: Drawable[] = [];

	public update(dt: number) {
		this.callbacks.forEach(cb => cb(dt));
		this.entities.forEach(e => {
			e.applyBehaviors(dt);
			e.applyDeltas();
		});
	}

	public draw(g: CanvasRenderingContext2D, dt: number) {
		this.background.forEach(d => d.draw(g, dt));
		this.entities.forEach(d => {
			g.save();
			g.translate(d.pos.x, d.pos.y);
			d.draw(g, dt)
			g.restore();
		});
		this.foreground.forEach(d => d.draw(g, dt));
	}

	public addCallback(cb: UpdateCallback) {
		this.callbacks.push(cb);
	}

	public addEntity(e: Entity) {
		this.entities.push(e);
	}

	public addBackgroundDrawable(graphic: Drawable | DrawFunction) {
		this.addDrawable(this.background, graphic);
	}

	public addForegroundDrawable(graphic: Drawable) {
		this.addDrawable(this.foreground, graphic);
	}

	private addDrawable(list: Drawable[], graphic: Drawable | DrawFunction) {
		if (typeof graphic === "function") {
			graphic = { draw: graphic };
		}
		list.push(graphic as Drawable);
	}

}