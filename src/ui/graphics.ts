import { World } from "../world";
import { Vec } from "../util/vec";
import { Env } from "../env";

export class Graphics {

	public g!: CanvasRenderingContext2D;
	private canvas!: HTMLCanvasElement;

	private lastTime = 0;
	private boundTick = this.tick.bind(this);

	private slide = new Vec(0, 0);

	constructor(
		public world: World
	) {
		window.addEventListener("resize", this.resize.bind(this));
		document.addEventListener('contextmenu', e => e.preventDefault());

		this.setCanvas();
		this.tick();
	}

	tick() {
		const now = Date.now();
		let dt = (now - this.lastTime) / 1000;
		this.lastTime = now;

		if (dt > .05) { dt = 0.05; }
		this.world.update(dt);
		this.draw(dt);

		requestAnimationFrame(this.boundTick);
	}

	setCanvas() {
		this.canvas = <HTMLCanvasElement> document.getElementById("canvas");

		const g = this.canvas.getContext("2d");
		if (g) { this.g = g; }
		else { /* TODO: Canvas unsupported error */ }

		this.resize();
		this.clear();
	}

	private draw(dt: number) {
		this.clear();

		this.g.save();

		this.g.translate(this.slide.x, this.slide.y);
		this.g.scale(Env.scale, Env.scale);
		this.world.draw(this.g, dt);

		this.g.restore();
	}

	private resize() {
		const x = this.canvas.clientWidth;
		const y = this.canvas.clientHeight;

		this.canvas.width = x;
		this.canvas.height = y;

		let scale = 1;
		// If too small, make bigger
		if (x > Env.REQ_SIZE.x) {
			scale = x / Env.REQ_SIZE.x;
		}
		if (y > Env.REQ_SIZE.y) {
			scale = Math.max(scale, y / Env.REQ_SIZE.y);
		}

		if (scale === 1) {
			// If too big, make smaller
			if (Env.REQ_SIZE.x > x || Env.REQ_SIZE.y > y) {
				scale = Math.max(x / Env.REQ_SIZE.x, y / Env.REQ_SIZE.y);
			}
		}

		Env.scale = Math.max(scale, 0.75);
	}

	private clear() {
		this.g.fillStyle = "#C0C0C0";
		this.g.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

}