import { Vec } from "./vec";
import { GraphNode } from "../graphs/node";
import { Env } from "../env";

export class Util {

	public static ERR = 0.001;

	public static RECT_SEGS = [
		[ -1, -1, -1, 1 ], // Left
		[ -1, -1, 1, -1 ], // Top
		[ -1, 1, 1, 1 ], // Bottom
		[ 1, -1, 1, 1 ], // Right
	];

	private static radToDeg = Math.PI / 180;
	public static radians(degrees: number): number {
		return degrees * this.radToDeg;
	}

	public static rayIntersection(p1: Vec, p2: Vec, p3: Vec, p4: Vec): Vec | undefined {
		const crossProd = Vec.sub(p2, p1).cross(Vec.sub(p4, p3));
		if (crossProd === 0) { return };
		const a = p1.cross(p2);
		const b = p3.cross(p4);
		return new Vec((a * (p3.x - p4.x) - b * (p1.x - p2.x)) / crossProd, (a * (p3.y - p4.y) - b * (p1.y - p2.y)) / crossProd);
	}

	public static pointInSegment(p1: Vec, p2: Vec, check: Vec): boolean {
		return check.x >= Math.min(p1.x, p2.x) - Util.ERR && check.x <= Math.max(p1.x, p2.x) + Util.ERR
			&& check.y >= Math.min(p1.y, p2.y) - Util.ERR && check.y <= Math.max(p1.y, p2.y) + Util.ERR;
	}

	public static segmentIntersectionPoint(p1: Vec, p2: Vec, p3: Vec, p4: Vec): Vec | undefined {
		const point = this.rayIntersection(p1, p2, p3, p4);
		if (point && this.pointInSegment(p1, p2, point) && this.pointInSegment(p3, p4, point)) {
			return point;
		}
	}

	public static rayCast(src: Vec, dest: Vec, radius: number, candidates: Set<GraphNode>): GraphNode | undefined {
		
		for (const n of candidates) {
			// Note: we only need to check 3 sides of the rectangle because
			// we're guaranteed to go through it
			for (const i of this.RECT_SEGS) {
				// Line segment that forms one side of a candidate square
				const edgeStart = new Vec(n.pos.x + i[0], n.pos.y + i[1]);
				const edgeEnd = new Vec(n.pos.x + i[2], n.pos.y + i[3]);

				const normal = Vec.sub(src, dest);
				normal.set(-normal.y, normal.x);
				normal.normalize();
				normal.mult(radius);

				const normalSrc = Vec.add(src, normal);
				const normalDest = Vec.add(dest, normal);

				if (this.segmentIntersectionPoint(normalSrc, normalDest, edgeStart, edgeEnd)) {
					return n;
				}

				normal.mult(2);
				normalSrc.sub(normal);
				normalDest.sub(normal);

				if (this.segmentIntersectionPoint(normalSrc, normalDest, edgeStart, edgeEnd)) {
					return n;
				}
			}
		}
	}

}

Util.RECT_SEGS.forEach(row => row.forEach((val, i) => {
	row[i] = val * Env.HALF_GRID_SIZE
}));