import { GraphNode } from "./node";
import { PriorityQueue } from "./pq";

export class Algorithm {

	public path?: GraphNode[];

	private open = new PriorityQueue<GraphNode>();
	private opened = new Set<GraphNode>();
	private closed = new Set<GraphNode>();

	public constructor(
		public start: GraphNode,
		public goal: GraphNode,
	) {
		start.g = 0;
		start.h = this.heuristic(start, goal);
		start.calcF();
		delete start.parent;
		this.open.enqueue(start);
	}

	private heuristic(a: GraphNode, b: GraphNode): number {
		return a.pos.dist(b.pos);
	}

	public solve() {
		while (true) {
			//Check end conditions
			if (this.closed.has(this.goal)) {
				this.pathBack();
				return;
			} else if (!this.open.length) {
				return;
			}

			//Add best candidate to closed list
			let candidate = this.open.dequeue();
			this.closed.add(candidate);

			//Set edges appropriately
			candidate.edges.forEach((edge, i) => {
				// Don't re-check closed nodes
				if (this.closed.has(edge)) { return; }

				//If node has already been visited, 
				if (this.opened.has(edge)) {
					// check to see if this path is shorter
					if (candidate.g + candidate.weights[i] < edge.g) {
						this.open.remove(edge);
						edge.g = candidate.g + candidate.weights[i];
						edge.calcF();
						edge.parent = candidate;
						this.open.enqueue(edge);
					}
				//Otherwise, just add the node to the open list
				} else {
					edge.g = candidate.g + candidate.weights[i];
					edge.h = this.heuristic(edge, this.goal);
					edge.calcF();
					edge.parent = candidate;
					this.open.enqueue(edge);
					this.opened.add(edge);
				}
			});
		}
	}

	/** Trace back the path to get from start to finish. */
	private pathBack() {
		this.path = [];
		const stack: GraphNode[] = [];
		let n: GraphNode | undefined = this.goal;
		while (n) {
			stack.push(n);
			n = n.parent;
		}
		while (stack.length) {
			this.path.push(stack.pop() as GraphNode);
		}
	}

}