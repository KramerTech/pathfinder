export type DrawFunction = (g: CanvasRenderingContext2D, dt: number) => void;

export interface Drawable {
	draw: DrawFunction;
}