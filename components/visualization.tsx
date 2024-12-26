"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Step, Edge, Vertex } from "@/types"
import { generateSteps } from "../dijkstra-algorithm"
import { X } from 'lucide-react'

const getNodeEdgePositions = (edges: Edge[], vertices: Vertex[]) => {
  const nodeEdgePositions: { [key: number]: { top: boolean, right: boolean, bottom: boolean, left: boolean } } = {};

  vertices.forEach(vertex => {
    nodeEdgePositions[vertex.id] = { top: false, right: false, bottom: false, left: false };
  });

  edges.forEach(edge => {
    const from = vertices.find(v => v.id === edge.from)!;
    const to = vertices.find(v => v.id === edge.to)!;
    
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);

    if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
      // Horizontal edge
      if (dx > 0) {
        nodeEdgePositions[edge.from].right = true;
        nodeEdgePositions[edge.to].left = true;
      } else {
        nodeEdgePositions[edge.from].left = true;
        nodeEdgePositions[edge.to].right = true;
      }
    } else {
      // Vertical edge
      if (dy > 0) {
        nodeEdgePositions[edge.from].bottom = true;
        nodeEdgePositions[edge.to].top = true;
      } else {
        nodeEdgePositions[edge.from].top = true;
        nodeEdgePositions[edge.to].bottom = true;
      }
    }
  });

  return nodeEdgePositions;
};

const pythonCode = `
import heapq

def dijkstra(graph, start):
    distTo = {node: float('infinity') for node in graph}
    distTo[start] = 0
    pq = [(0, start)]
    prev = {node: None for node in graph}

    while pq:
        current_distance, current_node = heapq.heappop(pq)

        if current_distance > distTo[current_node]:
            continue

        for neighbor, weight in graph[current_node].items():
            distance = current_distance + weight
            if distance < distTo[neighbor]:
                distTo[neighbor] = distance
                prev[neighbor] = current_node
                heapq.heappush(pq, (distance, neighbor))

    return distances, previous

# Graph representation
graph = {
    0: {1: 2, 2: 1},
    1: {3: 11, 4: 3, 2: 5},
    2: {5: 15},
    3: {4: 2},
    4: {2: 1, 5: 4, 6: 5},
    5: {},
    6: {3: 1, 5: 1}
}

start_node = 0
distances, previous = dijkstra(graph, start_node)

print("Shortest distances from node", start_node)
for node, distance in distances.items():
    print(f"Node {node}: {distance}")

print("\\nShortest paths:")
for node in graph:
    if node != start_node:
        path = []
        current = node
        while current is not None:
            path.append(current)
            current = previous[current]
        path.reverse()
        print(f"Path to node {node}: {' -> '.join(map(str, path))}")
`

export default function DijkstraVisualization() {
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    setSteps(generateSteps())
  }, [])

  if (steps.length === 0) return null

  const step = steps[currentStep]

  const isEdgeInShortestPathTree = (edge: Edge) => {
    return step.edgeTo[edge.to] === edge.from;
  };

  const nodeSize = 40
  const halfNodeSize = nodeSize / 2

  // Helper function to calculate edge points
  const calculateEdgePoints = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const dx = to.x - from.x
    const dy = to.y - from.y
    const angle = Math.atan2(dy, dx)

    // Determine which side of the square to use
    let fromX, fromY, toX, toY

    if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
      // Horizontal edge
      fromX = from.x + (dx > 0 ? halfNodeSize : -halfNodeSize)
      fromY = from.y
      toX = to.x + (dx > 0 ? -halfNodeSize : halfNodeSize)
      toY = to.y
    } else {
      // Vertical edge
      fromX = from.x
      fromY = from.y + (dy > 0 ? halfNodeSize : -halfNodeSize)
      toX = to.x
      toY = to.y + (dy > 0 ? -halfNodeSize : halfNodeSize)
    }

    return { fromX, fromY, toX, toY }
  }

  const nodeEdgePositions = getNodeEdgePositions(step.edges, step.vertices);

  return (
    <div className="container mx-auto px-4 sm:px-8 xl:px-16 2xl:px-24 relative mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 lg:items-center lg:justify-center lg:gap-4"> {/* Update 1 */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-0 text-center w-full"> {/* Update 2 */}
          Dijkstra&apos;s Shortest Path Algorithm
        </h1>
        <div className="lg:absolute lg:right-4 xl:right-16 2xl:right-24 lg:top-0"> {/* Update 3 */}
          <Button
            className="text-xs sm:text-sm md:text-base whitespace-nowrap"
            onClick={() => setShowPopup(true)}
          >
            Show Python Code
          </Button>
        </div>
      </div>
      <div className="font-mono text-md text-center mb-6 mx-auto">
        <p className="mb-2">Insert all vertices into fringe PQ, storing vertices in order of distance from source.</p>
        <p>Repeat: Remove (closest) vertex v from PQ, and relax all edges pointing from v.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full">
        <Card className="w-full lg:flex-grow p-4">
          <div className="w-full aspect-[2/1]">
            <svg viewBox="0 0 900 400" className="w-full h-full">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="10"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                </marker>
                <marker
                  id="arrowhead-active"
                  markerWidth="10"
                  markerHeight="7"
                  refX="10"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#FF00FF" />
                </marker>
                <marker
                  id="arrowhead-bold"
                  markerWidth="10"
                  markerHeight="7"
                  refX="10"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#000" />
                </marker>
              </defs>
              {/* Draw edges */}
              {step.edges.map((edge) => {
                const from = step.vertices.find((v) => v.id === edge.from)!
                const to = step.vertices.find((v) => v.id === edge.to)!
                const { fromX, fromY, toX, toY } = calculateEdgePoints(from, to)
                
                // Calculate the midpoint
                const midX = (fromX + toX) / 2
                const midY = (fromY + toY) / 2
                
                // Determine if the edge is more vertical or horizontal
                const isVertical = Math.abs(toY - fromY) > Math.abs(toX - fromX)
                
                // Adjust text position
                const textX = isVertical ? midX + 15 : midX
                const textY = isVertical ? midY : midY - 15
                
                const isInShortestPathTree = isEdgeInShortestPathTree(edge);
                
                return (
                  <g key={`${edge.from}-${edge.to}`}>
                    <line
                      x1={fromX}
                      y1={fromY}
                      x2={toX}
                      y2={toY}
                      stroke={isInShortestPathTree ? "#000" : edge.active ? "#FF00FF" : "#666"}
                      strokeWidth={isInShortestPathTree ? 3 : 2}
                      markerEnd={isInShortestPathTree ? "url(#arrowhead-bold)" : edge.active ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                    />
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      fill="#666"
                      dominantBaseline="middle"
                    >
                      {edge.weight}
                    </text>
                  </g>
                )
              })}

              {/* Draw vertices */}
              {step.vertices.map((vertex) => {
                const hasTopEdge = nodeEdgePositions[vertex.id].top;
                return (
                  <g key={vertex.id}>
                    <rect
                      x={vertex.x - halfNodeSize}
                      y={vertex.y - halfNodeSize}
                      width={nodeSize}
                      height={nodeSize}
                      fill={vertex.processed ? "white" : "#90EE90"}
                      stroke="#666"
                      strokeWidth={2}
                    />
                    <text
                      x={vertex.x}
                      y={vertex.y + 5}
                      textAnchor="middle"
                      fill="#000"
                    >
                      {vertex.id}
                    </text>
                    <text
                      x={vertex.x + (hasTopEdge ? 20 : 0)}
                      y={vertex.y - 30}
                      textAnchor={hasTopEdge ? "start" : "middle"}
                      fill="#FF00FF"
                    >
                      {step.distTo[vertex.id] === Infinity ? "∞" : step.distTo[vertex.id]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </Card>

        <Card className="w-full lg:w-1/4 xl:w-1/5 p-4">
          <div className="font-mono">
            <table className="w-full table-fixed">
              <thead>
                <tr>
                  <th className="text-center w-1/4">#</th>
                  <th className="text-center w-2/5">distTo</th>
                  <th className="text-center w-1/3">edgeTo</th>
                </tr>
              </thead>
              <tbody>
                {step.distTo.map((dist, i) => (
                  <tr key={i}>
                    <td className="text-center">{i}</td>
                    <td className="text-center">{dist === Infinity ? "∞" : dist}</td>
                    <td className="text-center">{step.edgeTo[i] === -1 ? "-" : step.edgeTo[i]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="font-mono text-md mt-4">
              <p className="font-bold mb-2">Fringe:</p>
              <div className="lg:pl-4">
                {step.fringe.length === 0 ? (
                  <span>[]</span>
                ) : (
                  [...step.fringe]
                    .sort((a, b) => a[1] - b[1])
                    .map(([id, dist], index) => (
                      <span key={id} className="lg:block">
                        {index === 0 && '['}
                        ({id}: {dist === Infinity ? "∞" : dist})
                        {index < step.fringe.length - 1 ? (
                          <span className="lg:hidden">, </span>
                        ) : (
                          ']'
                        )}
                      </span>
                    ))
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-4 justify-center mt-8">
        <Button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          Previous Step
        </Button>
        <Button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
        >
          Next Step
        </Button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-[90vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Dijkstra&apos;s Algorithm in Python</h2>
              <Button variant="ghost" onClick={() => setShowPopup(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
              <code className="language-python">{pythonCode}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

