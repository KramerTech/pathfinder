export interface Comparable {
	compareTo(other: Comparable): number;
}

export class PriorityQueue<T extends Comparable> {
	
	private queue: T[] = [];

	public get length() { return this.queue.length; }

	public enqueueAll(...elements: T[]) {
		elements.forEach(e => this.enqueue(e));
	}

	public enqueue(element: T) {
		this.queue.push(element);
		if (this.queue.length > 1) {
			this.siftUp(element)
		}
	}

	public dequeue(): T {
		const result = this.queue[0];
		const last = this.queue[this.queue.length - 1];
		if (--this.queue.length > 0) {
			this.siftDown(last);
		}
		return result;
	}

	public peek(): T {
		return this.queue[0];
	}

	public remove(element: T): boolean {
		const at = this.queue.indexOf(element);
		if (at < 0) { return false; }
		this.removeAt(at);
		return true;
	}

	public removeAt(i: number) {
		// Get the last element of the array and remove it
		const last = this.queue[this.queue.length - 1];
		// Don't have to do anything else if i was the last element
		if (i < --this.queue.length) {
			this.siftDown(last, i);
			if (this.queue[i] == last) {
				this.siftUp(last, i);
			}
		}
	}

	public clear() {
		this.queue.length = 0;
	}

	/**
	* Inserts item x at position k, maintaining heap invariant by
	* promoting x up the tree until it is greater than or equal to
	* its parent, or is the root.
	*/
	private siftUp(x: T, k = this.queue.length - 1) {
		while (k > 0) {
			const parent = (k - 1) >>> 1;
			const e = this.queue[parent];
			if (x.compareTo(e) >= 0) { break; }
			this.queue[k] = e;
			k = parent;
		}
		this.queue[k] = x;
	}

	/**
	* Inserts item x at position k, maintaining heap invariant by
	* demoting x down the tree repeatedly until it is less than or
	* equal to its children or is a leaf.
	*/
	private siftDown(x: T, k = 0) {
		const half = this.queue.length >>> 1;        // loop while a non-leaf
		while (k < half) {
			let child = (k << 1) + 1; // assume left child is least
			const right = child + 1;
			let c = this.queue[child];
			if (right < this.queue.length && c.compareTo(this.queue[right]) > 0) {
				child = right;
				c = this.queue[child];
			}
			if (x.compareTo(c) <= 0) { break; }
			this.queue[k] = c;
			k = child;
		}
		this.queue[k] = x;
	}

}