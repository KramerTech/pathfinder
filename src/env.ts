import { GraphNode } from "./graphs/node";
import { Vec } from "./util/vec";

export class Env {

	static TARGET_SIZE = new Vec(1920, 1080);

	static GRID_SIZE = 24;
	static HALF_GRID_SIZE = Env.GRID_SIZE / 2;
	static SHADOW = 4;
	
	static GRID_DIM = Vec.div(Env.TARGET_SIZE, Env.GRID_SIZE).ceil();
	static REQ_SIZE = Vec.mult(Env.GRID_DIM, Env.GRID_SIZE);

	static scale = 1;
	static shifting = false;
	static highlight: GraphNode;


}