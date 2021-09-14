import { Game } from "../main";
import { Vec } from "../util/vec";
import { Env } from "../env";

export class Input {

	public static moveDelta = new Vec();

	private mouseDown?: number;
	private lastAdjust?: Vec;

	constructor(
		public game: Game,
	) {
		window.addEventListener("mousedown", this.down.bind(this));
		window.addEventListener("mouseup", this.up.bind(this));
		// window.addEventListener("wheel", this.wheel.bind(this));
		window.addEventListener("mousemove", this.move.bind(this));
		window.addEventListener("keydown", this.keyDown.bind(this));
		window.addEventListener("keyup", this.keyUp.bind(this));
	}

	private keyDown(key: KeyboardEvent) {
		if (key.keyCode === 16) {
			Env.shifting = true;
			delete this.lastAdjust;
		} else if (key.key === 'r') {
			this.game.reset();
		} else if (key.key === 'm') {
			this.game.maze();
		}
	}

	private keyUp(key: KeyboardEvent) {
		if (key.keyCode === 16) {
			delete this.lastAdjust;
			Env.shifting = false;
		}
	}

	private down(event: MouseEvent) {
		if (this.mouseDown !== undefined) { return; }
		this.mouseDown = event.button;
		if (this.mouseDown === 2) {
			this.dragRight(event);
		} else if (this.mouseDown === 0) {
			this.drag(event);
		}
	}

	private up(event: MouseEvent) {
		delete this.lastAdjust;
		if (this.mouseDown === event.button) {
			delete this.mouseDown;
		}
	}

	// private wheel(event: MouseWheelEvent) {
	// 	// Env.zoom(event.deltaY > 0);
	// }
		
	private move(event: MouseEvent) {
		if (this.mouseDown === 0) {
			this.drag(event);
		} else if (this.mouseDown === 2) {
			this.dragRight(event);
		}
		this.game.highlight(event.clientX / Env.scale, event.clientY / Env.scale);
	}

	private drag(event: MouseEvent) {
		const x = event.clientX / Env.scale;
		const y = event.clientY / Env.scale;
		this.game.setNode(x, y, this.lastAdjust);
		this.lastAdjust = new Vec(x, y);
	}

	private dragRight(event: MouseEvent) {
		// delete this.game.highlight;
		this.game.setGoal(event.clientX / Env.scale, event.clientY / Env.scale);
	}

}