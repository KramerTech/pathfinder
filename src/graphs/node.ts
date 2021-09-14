import { Vec } from "../util/vec"
import { Comparable } from "./pq";
import { Drawable } from "../ui/drawable";
import { Env } from "../env";

export class GraphNode implements Comparable, Drawable {

	// A* values
	public parent?: GraphNode;
	public f = 0;
	public h = 0;
	public g = 0;
	public valid = true;

	public edges: GraphNode[] = [];
	public weights: number[] = [];
	public obstacles: GraphNode[] = [];

	public constructor (
		public index: Vec,
		public pos: Vec,
	) {}

	public clearEdges() {
		this.edges.length = 0;
		this.weights.length = 0;
	}

	/** Add an edge to the node with the given weight. */
	public edge(node: GraphNode, weight: number) {
		this.edges.push(node);
		this.weights.push(weight);
	}

	/** Add an edge to the node with the given weight,
	* and do the same to the other node in question. */
	public doubleEdge(node: GraphNode, weight: number) {
		this.edge(node, weight);
		node.edge(this, weight);
	}

	/** For the purpose of the GUIs, equality is based on 2D position. */
	public equals(other: any) {
		if (!(other instanceof GraphNode)) return false;
		return this.pos.equals(other.pos);
	}

	/** Compare first on F value, then on H value. */
	public compareTo(other: GraphNode): number {
		let c = this.f - other.f;
		if (c != 0) { return c; }
		return this.h - other.h;
	}

	/** Add movement and heuristic values to get F value. */
	public calcF(): void { this.f = this.g + this.h; }

	draw(g: CanvasRenderingContext2D): void {
		g.fillStyle = "#a200cc";
		g.beginPath();
		g.moveTo(-Env.HALF_GRID_SIZE, Env.HALF_GRID_SIZE);
		g.lineTo(-Env.HALF_GRID_SIZE - Env.SHADOW, Env.HALF_GRID_SIZE - Env.SHADOW);
		g.lineTo(Env.HALF_GRID_SIZE - Env.SHADOW, -Env.HALF_GRID_SIZE - Env.SHADOW);
		g.lineTo(Env.HALF_GRID_SIZE, -Env.HALF_GRID_SIZE);
		g.lineTo(Env.HALF_GRID_SIZE, Env.HALF_GRID_SIZE);
		g.fill();

		g.fillStyle = "#b200ff";

		g.fillRect(-Env.HALF_GRID_SIZE - Env.SHADOW,
			-Env.HALF_GRID_SIZE - Env.SHADOW,
			Env.GRID_SIZE, Env.GRID_SIZE);
	}

}