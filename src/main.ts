import { Vec } from "./util/vec";
import { Util } from "./util/util";
import { GraphNode } from "./graphs/node";
import { Boid } from "./entities/boid";
import { SeekTarget } from "./behaviors/seek-target";
import { Algorithm } from "./graphs/algorithm";
import { BreadCrumbs } from "./behaviors/crumbs";
import { AlignToVelocity } from "./behaviors/velocity-align";
import { CapVelocity, CapAcceleration, CapRotation } from "./behaviors/caps";
import { World } from "./world";
import { Graphics } from "./ui/graphics";
import { Input } from "./ui/input";
import { DrawGrid } from "./ui/draw-grid";
import { Env } from "./env";
import { Maze } from "./util/maze";

export class Game {

	private nodes!: GraphNode[][];
	private goal?: GraphNode;
	private fineGoal?: Vec;
	private algo?: Algorithm;
	
	private xOff = 0;
	private yOff = 0;

	private boid: Boid;
	private crumbs: BreadCrumbs;
	private seekTarget: SeekTarget;
	
	private world = new World();

	private smoothing = true;

	public constructor() {
		this.initGrid();
		
		this.boid = new Boid(new Vec(200, 200));
			
		this.seekTarget = new SeekTarget(new Vec(200, 200), 1);
		this.crumbs = new BreadCrumbs(35, 35);
		this.boid.setBehaviors(
			this.crumbs,
			this.seekTarget,
			new AlignToVelocity(),
			new CapAcceleration(0.3),
			new CapRotation(Util.radians(6)),
			new CapVelocity(1.2)
		);

		this.world.addCallback(this.reTarget.bind(this));
		this.world.addBackgroundDrawable(this.crumbs);
		this.world.addBackgroundDrawable(this.drawPathing.bind(this));
		this.world.addEntity(this.boid);
		this.world.addForegroundDrawable(new DrawGrid(this.nodes));
		new Input(this);
		new Graphics(this.world);
	}

	private initGrid() {
		this.nodes = [];
		for (let y = 0; y < Env.GRID_DIM.y; y++) {
			const row: GraphNode[] = [];
			for (let x = 0; x < Env.GRID_DIM.x; x++) {
				const screenPos = new Vec(Env.HALF_GRID_SIZE + x * Env.GRID_SIZE, Env.HALF_GRID_SIZE + y * Env.GRID_SIZE);
				row.push(new GraphNode(new Vec(x, y), screenPos));
			}
			this.nodes.push(row);
		}
		this.setEdges();
	}

	private setEdges() {
		this.nodes.forEach(row => row.forEach(node => node.clearEdges()));
		for (let y = 0; y < Env.GRID_DIM.y; y++) {
			for (let x = 0; x < Env.GRID_DIM.x; x++) {
				const n = this.nodes[y][x];
				if (!n.valid) { continue; }
				if (y > 0 && this.nodes[y - 1][x].valid) {
					n.doubleEdge(this.nodes[y - 1][x], n.pos.dist(this.nodes[y - 1][x].pos));
				}
				if (x > 0) {
					if (this.nodes[y][x - 1].valid) {
						n.doubleEdge(this.nodes[y][x - 1], n.pos.dist(this.nodes[y][x - 1].pos));
					}
					if (y > 0 && this.nodes[y - 1][x - 1].valid && this.nodes[y][x - 1].valid && this.nodes[y - 1][x].valid) {
						n.doubleEdge(this.nodes[y - 1][x - 1], n.pos.dist(this.nodes[y - 1][x - 1].pos));
					}
					if (y < Env.GRID_DIM.y - 1 && this.nodes[y + 1][x - 1].valid
							&& this.nodes[y + 1][x].valid && this.nodes[y][x - 1].valid) {
						n.doubleEdge(this.nodes[y + 1][x - 1], n.pos.dist(this.nodes[y + 1][x - 1].pos));
					}
				}
			}
		}
	}

	private solve() {
		if (!this.goal) { return; }
		const boidNode = this.boidNode;
		if (!boidNode) { return; }
		
		if (this.goal === this.boidNode) {
			this.seekTarget.target = this.fineGoal as Vec;
			delete this.algo;
		} else {
			this.algo = new Algorithm(boidNode, this.goal);
			this.algo.solve();
		}
	}

	public setGoal(x: number, y: number) {
		const grid = this.worldToIndex(x, y);
		if (!grid) return;

		const goal = this.getNode(grid)
		if (!goal.valid) { return; }

		this.goal = goal;
		this.fineGoal = new Vec(x, y);

		this.solve();
	}

	private getNode(index: Vec): GraphNode {
		return this.nodes[index.y][index.x];
	}

	public setNode(x: number, y: number, lastAdjust?: Vec) {
		const index = this.worldToIndex(x, y);
		if (index == null) return;

		let adjust: Iterable<GraphNode> = [this.getNode(index)];

		let lastIndex;
		if (lastAdjust) {
			lastIndex = this.worldToIndex(lastAdjust.x, lastAdjust.y);
			if (lastIndex && lastIndex.dist(index) >= 2) {
				adjust = this.getNodesOnLine(lastAdjust, new Vec(x, y), false);
			}
		}

		let changed = false;

		for (const node of adjust) {
			// Disallow drawing on boid
			if (!Env.shifting && this.boidNode && this.boidNode.pos.dist(node.pos) < 2 * Env.GRID_SIZE) {
				continue;
			}
			// Disallow coloring on the goal
			if (node === this.goal) { continue; }
			// Don't resolve if nothing changed
			if (node.valid === Env.shifting) { continue; }

			node.valid = Env.shifting;
			changed = true;
		}

		if (changed) {
			this.setEdges();
			this.solve();
		}
	}

	public worldToIndex(x: number, y: number): Vec | undefined {
		if (x < 0 || x >= Env.GRID_DIM.x * Env.GRID_SIZE
			|| y < 0 || y >= Env.GRID_DIM.y * Env.GRID_SIZE
		) {
			return;
		}
		const a = Math.floor((x - this.xOff) / Env.GRID_SIZE);
		const  b = Math.floor((y - this.yOff) / Env.GRID_SIZE);
		if (a < 0) return;
		if (b < 0) return;
		if (a >= Env.GRID_DIM.x) return;
		if (b >= Env.GRID_DIM.y) return;
		return new Vec(a, b);
	}

	private screenToNode(pos: Vec): GraphNode | undefined {
		const index = this.worldToIndex(pos.x, pos.y);
		if (index) { return this.nodes[index.y][index.x]; }
	}

	private get boidNode(): GraphNode | undefined {
		return this.screenToNode(this.boid.pos);
	}

	// private get boidIndex(): Vec | undefined {
	// 	return this.screenToIndex(this.boid.pos.x, this.boid.pos.y);
	// }

	private reTarget() {
		const boidNode = this.boidNode;
		this.seekTarget.target = this.boid.pos;
		if (this.fineGoal && this.algo && this.algo.path) {
			if (this.smoothing) {
				// Attempt to short-cut to the destination
				let obstacles = this.getNodesOnLine(this.boid.pos, this.fineGoal);
				if (!Util.rayCast(this.boid.pos, this.fineGoal, this.boid.radius, obstacles)) {
					this.seekTarget.target = this.fineGoal;
				} else {
					// If that doesn't work, try to get as far along as we can
					for (let i = this.algo.path.length - 1; i >= 0; i--) {
						const target = this.algo.path[i].pos;
						obstacles = this.getNodesOnLine(this.boid.pos, target);
						if (!Util.rayCast(this.boid.pos, target, this.boid.radius, obstacles)) {
							this.seekTarget.target = target;
							break;
						}
					}
				}
			} else {
				// Follow the path directly
				for (let i = 0; i < this.algo.path.length - 1; i++) {
					const curr = this.algo.path[i];
					const next = this.algo.path[i + 1];

					if (curr == boidNode) {
						if (next == this.goal) {
							this.seekTarget.target = this.fineGoal;
						} else {
							this.seekTarget.target = next.pos;
						}
					}
				}
			}
		}
	}

	private drawPathing(g: CanvasRenderingContext2D) {
		if (this.fineGoal) {
			if (this.algo && this.algo.path) {
				g.strokeStyle = "#FFFF00";
				let prev = this.algo.path[0].pos;
				for (let i = 1; i < this.algo.path.length; i++) {
					let curr = this.algo.path[i].pos;
					g.beginPath();
					g.moveTo(prev.x, prev.y);
					g.lineTo(curr.x, curr.y);
					g.stroke();
					prev = curr;
				}

				// Draw short-cut target
				if (this.smoothing) {
					g.strokeStyle = "red";
					g.beginPath();
					g.moveTo(this.boid.pos.x, this.boid.pos.y);
					g.lineTo(this.seekTarget.target.x, this.seekTarget.target.y);
					g.stroke();
				}
			}

			// Draw goal
			g.fillStyle = "#C96500";
			g.beginPath();
			g.ellipse(this.fineGoal.x, this.fineGoal.y, 4, 4, 0, 0, Vec.TWO_PI);
			g.fill();

		}
	}

	public reset() {
		this.nodes.forEach(row => row.forEach(node => {
			node.valid = true;
		}));
		this.crumbs.clear();
		this.setEdges();
		this.solve();
	}

	public maze() {
		delete this.fineGoal;
		delete this.algo;
		
		const start = Maze.prims(this.nodes);
		
		this.boid.pos.set(start.pos);
		this.seekTarget.target = start.pos;
		
		this.crumbs.clear();
		this.setEdges();
	}
	
	public highlight(x: number, y: number) {
		const node = this.screenToNode(new Vec(x, y));
		if (node) { Env.highlight = node; }
		else { delete Env.highlight; }
	}

	private getNodesOnLine(src: Vec, dest: Vec, forRaycast = true): Set<GraphNode> {
		const nodes = new Set<GraphNode>();

		let start = this.worldToIndex(src.x, src.y);
		let end = this.worldToIndex(dest.x, dest.y);
		if (!start || !end) { return nodes; }

		const deltaX = start.x - end.x;
		const deltaY = start.y - end.y;
		
		if (deltaX == 0) {
			// Special case for vertical line
			for (let y = Math.min(start.y, end.y); y <= Math.max(start.y, end.y); y++) {
				forRaycast ? this.addSurroundingObstacles(start.x, y, nodes) : nodes.add(this.nodes[y][start.x]);
			}
		} else {
			let error = 0;
			const deltaErr = Math.abs(deltaY / deltaX);
			if (start.x > end.x) {
				const tmp = start;
				start = end;
				end = tmp;
			}
			let y = start.y;
			const yDir = Math.sign(end.y - start.y);
			for (let x = start.x; x <= end.x; x ++) {
				forRaycast ? this.addSurroundingObstacles(x, y, nodes) : nodes.add(this.nodes[y][x]);
				error += deltaErr;
				while (error >= 0.5) {
					forRaycast ? this.addSurroundingObstacles(x, y, nodes) : nodes.add(this.nodes[y][x]);
					y += yDir;
					error -= 1;
				}
			}
		}
		return nodes;
	}

	private addSurroundingObstacles(gridX: number, gridY: number, blockers: Set<GraphNode>) {
		for (let x = gridX - 1; x <= gridX + 1; x++) {
			for (let y = gridY - 1; y <= gridY + 1; y++) {
				if (x >= 0 && x < Env.GRID_DIM.x
					&& y >= 0 && y < Env.GRID_DIM.y
					&& !this.nodes[y][x].valid
				) {
					blockers.add(this.nodes[y][x]);
				}
			}
		}
	}

	// public getName() {
	// 	return "Navigation | " + GraphSolver.HEURISTICS[heuristic].getName() +
	// 		" | " + (smoothing ? "Path Smoothing" : "Path Following");
	// }

}

new Game();