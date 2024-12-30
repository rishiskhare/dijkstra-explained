import { Step, Vertex, Edge } from './types';

class MinHeap {
  private heap: [number, number][];

  constructor() {
    this.heap = [];
  }

  private parent(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private leftChild(i: number): number {
    return 2 * i + 1;
  }

  private rightChild(i: number): number {
    return 2 * i + 2;
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  insert(node: [number, number]): void {
    this.heap.push(node);
    this.bubbleUp(this.heap.length - 1);
  }

  extractMin(): [number, number] | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return min;
  }

  private bubbleUp(i: number): void {
    while (i > 0 && this.heap[i][1] < this.heap[this.parent(i)][1]) {
      this.swap(i, this.parent(i));
      i = this.parent(i);
    }
  }

  private bubbleDown(i: number): void {
    const size = this.heap.length;
    let minIndex = i;

    while (true) {
      const leftChild = this.leftChild(i);
      const rightChild = this.rightChild(i);

      if (leftChild < size && this.heap[leftChild][1] < this.heap[minIndex][1]) {
        minIndex = leftChild;
      }

      if (rightChild < size && this.heap[rightChild][1] < this.heap[minIndex][1]) {
        minIndex = rightChild;
      }

      if (minIndex !== i) {
        this.swap(i, minIndex);
        i = minIndex;
      } else {
        break;
      }
    }
  }

  updateKey(nodeId: number, newDist: number): void {
    const index = this.heap.findIndex(([id]) => id === nodeId);
    if (index !== -1) {
      this.heap[index][1] = newDist;
      this.bubbleUp(index);
    }
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  copy(): MinHeap {
    const newHeap = new MinHeap();
    newHeap.heap = this.heap.map(item => [...item]);
    return newHeap;
  }

  toArray(): [number, number][] {
    return [...this.heap];
  }
}

export function generateSteps(customVertices?: Vertex[], customEdges?: Edge[], startNode: number = 0): Step[] {
  // Initial graph setup
  const initialVertices: Vertex[] = customVertices || [
    { id: 0, distance: 0, processed: false, x: 100, y: 200 },
    { id: 1, distance: Infinity, processed: false, x: 300, y: 100 },
    { id: 2, distance: Infinity, processed: false, x: 300, y: 300 },
    { id: 3, distance: Infinity, processed: false, x: 500, y: 50 },
    { id: 4, distance: Infinity, processed: false, x: 500, y: 200 },
    { id: 5, distance: Infinity, processed: false, x: 500, y: 350 },
    { id: 6, distance: Infinity, processed: false, x: 700, y: 200 },
  ];

  const edges: Edge[] = customEdges || [
    { from: 0, to: 1, weight: 2, active: false },
    { from: 0, to: 2, weight: 1, active: false },
    { from: 1, to: 3, weight: 11, active: false },
    { from: 1, to: 4, weight: 3, active: false },
    { from: 1, to: 2, weight: 5, active: false },
    { from: 2, to: 5, weight: 15, active: false },
    { from: 3, to: 4, weight: 2, active: false },
    { from: 4, to: 2, weight: 1, active: false },
    { from: 4, to: 5, weight: 4, active: false },
    { from: 4, to: 6, weight: 5, active: false },
    { from: 6, to: 3, weight: 1, active: false },
    { from: 6, to: 5, weight: 1, active: false },
  ];

  const steps: Step[] = [];
  const distTo = new Map<number, number>();
  const edgeTo = new Map<number, number>();
  initialVertices.forEach(v => {
    distTo.set(v.id, v.id === startNode ? 0 : Infinity);
    edgeTo.set(v.id, -1);
  });

  // Initialize fringe with all vertices
  const fringe = new MinHeap();
  initialVertices.forEach(vertex => {
    const distance = vertex.id === startNode ? 0 : Infinity;
    fringe.insert([vertex.id, distance]);
  });

  steps.push({
    vertices: [...initialVertices],
    edges: [...edges],
    fringe: fringe.copy().toArray(),
    currentVertex: null,
    distTo: new Map(distTo),
    edgeTo: new Map(edgeTo),
  });

  while (!fringe.isEmpty()) {
    const [v, dist] = fringe.extractMin()!;

    if (dist > distTo.get(v)!) continue;

    const currentVertices = steps[steps.length - 1].vertices.map(vertex => ({
      ...vertex,
      processed: vertex.id === v ? true : vertex.processed
    }));

    const currentEdges = edges.map(edge => ({
      ...edge,
      active: edge.from === v
    }));

    // Update distances and fringe for adjacent vertices
    edges
      .filter(e => e.from === v)
      .forEach(e => {
        const newDist = distTo.get(v)! + e.weight;
        if (newDist < (distTo.get(e.to) ?? Infinity)) {
          distTo.set(e.to, newDist);
          edgeTo.set(e.to, v);
          fringe.updateKey(e.to, newDist);
        }
      });

    // Add the step after updating the fringe
    steps.push({
      vertices: currentVertices,
      edges: currentEdges,
      fringe: fringe.copy().toArray(),
      currentVertex: v,
      distTo: new Map(distTo),
      edgeTo: new Map(edgeTo),
    });
  }

  return steps;
}

