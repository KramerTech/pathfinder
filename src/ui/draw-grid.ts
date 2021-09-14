import { GraphNode } from "../graphs/node";
import { Drawable } from "./drawable";

export class DrawGrid implements Drawable {

	constructor(private grid: GraphNode[][]) {}

	draw(g: CanvasRenderingContext2D): void {
		this.grid.forEach(row => {
			row.forEach(node => {
				if (node.valid) { return; }
				g.save();
				g.translate(node.pos.x, node.pos.y)
				node.draw(g);
				g.restore();
			})
		});
	}

}