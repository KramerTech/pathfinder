import { GraphNode } from "../graphs/node";
import { Vec } from "./vec";
import { Env } from "../env";

export class Maze {

	static prims(nodes: GraphNode[][]): GraphNode {
		nodes.forEach(row => row.forEach(node => {
			node.valid = false;
			node.clearEdges();
		}));
		for (let x = 2; x < nodes[0].length; x++) {
			nodes[0][x].doubleEdge(nodes[0][x - 2], 1);
			for (let y = 2; y < nodes.length; y++) {
				nodes[y][x].doubleEdge(nodes[y][x - 2], 1);
				nodes[y][x].doubleEdge(nodes[y - 2][x], 1);
			}
		}
		for (let y = 2; y < nodes.length; y++) {
			nodes[y][0].doubleEdge(nodes[y - 2][0], 1);
		}


		let startPos: Vec;
		let start: GraphNode;
		do {
			startPos = new Vec(
				Math.random() * nodes[0].length,
				Math.random() * nodes.length,
			).floor();
			start = nodes[startPos.y][startPos.x];
		} while (
			start.pos.x * Env.scale > window.innerWidth
			|| start.pos.y * Env.scale > window.innerHeight
		);

		start.valid = true;

		const walls: GraphNode[][] = [];
		const seen = new Set<GraphNode>();
		start.edges.forEach(wall => {
			walls.push([wall, start]);
			seen.add(wall)
		});
		while (walls.length) {
			const randomIndex = Math.floor(Math.random() * walls.length);
			
			// Remove from list and replace with last element
			const candidate = walls[randomIndex];
			const wall = candidate[0];
			walls[randomIndex] = walls[walls.length - 1];
			walls.length--;

			wall.valid = true;
			const between = Vec.add(wall.index, candidate[1].index).div(2);
			nodes[between.y][between.x].valid = true;
			wall.edges.forEach(edge => {
				if (!edge.valid && !seen.has(edge)) {
					walls.push([edge, wall]);
					seen.add(edge);
				}
			});
		}
		
		return start;
	}

}