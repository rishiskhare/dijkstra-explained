export interface Vertex {
  id: number;
  distance: number;
  processed: boolean;
  x: number;
  y: number;
}

export interface Edge {
  from: number;
  to: number;
  weight: number;
  active: boolean;
}

export interface Step {
  vertices: Vertex[];
  edges: Edge[];
  fringe: Array<[number, number]>;
  currentVertex: number | null;
  distTo: number[];
  edgeTo: number[];
}
