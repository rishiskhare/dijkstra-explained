"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Vertex, Edge } from "./types"
import { X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EditEdgesPopup } from './edit-edges-popup'
import { Check } from 'lucide-react'

interface EditGraphProps {
  vertices: Vertex[]
  edges: Edge[]
  startNode: number
  onSave: (newVertices: Vertex[], newEdges: Edge[], newStartNode: number) => void
}

const nodeSize = 40
const halfNodeSize = nodeSize / 2

const calculateEdgePoints = (from: { x: number; y: number }, to: { x: number; y: number }) => {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const angle = Math.atan2(dy, dx)

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

export default function EditGraph({ vertices, edges, startNode: initialStartNode, onSave }: EditGraphProps) {
  const [editedVertices, setEditedVertices] = useState<Vertex[]>(vertices)
  const [editedEdges, setEditedEdges] = useState<Edge[]>(edges)
  const [dragging, setDragging] = useState<number | null>(null)
  const [editingEdge, setEditingEdge] = useState<string | null>(null)
  const [startNode, setStartNode] = useState<number>(initialStartNode)
  const [showEdgePopup, setShowEdgePopup] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const handleMouseDown = (id: number) => () => {
    setDragging(id)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging !== null && svgRef.current) {
      const svg = svgRef.current
      const pt = svg.createSVGPoint()
      pt.x = e.clientX
      pt.y = e.clientY
      const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse())

      setEditedVertices(
        editedVertices.map((vertex) =>
          vertex.id === dragging
            ? { ...vertex, x: svgP.x, y: svgP.y }
            : vertex
        )
      )
    }
  }

  const handleMouseUp = () => {
    setDragging(null)
  }

  const handleEdgeClick = (edgeId: string) => {
    setEditingEdge(edgeId)
  }

  const handleEdgeValueChange = (edgeId: string, newValue: string) => {
    setEditedEdges(
      editedEdges.map((edge) =>
        `${edge.from}-${edge.to}` === edgeId ? { ...edge, tempWeight: newValue } : edge
      )
    )
  }

  const handleEdgeInputBlur = (edgeId: string) => {
    setEditedEdges(
      editedEdges.map((edge) => {
        if (`${edge.from}-${edge.to}` === edgeId) {
          const numericValue = parseInt(edge.tempWeight || '', 10)
          return {
            ...edge,
            weight: !isNaN(numericValue) && numericValue >= 0 ? numericValue : edge.weight,
            tempWeight: undefined
          }
        }
        return edge
      })
    )
    setEditingEdge(null)
  }

  const handleEdgeInputKeyPress = (edgeId: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEdgeInputBlur(edgeId);
    }
  };

  const addNode = () => {
    const usedIds = new Set(editedVertices.map(v => v.id));
    let newId = 0;
    while (usedIds.has(newId)) {
      newId++;
    }
    const newNode: Vertex = {
      id: newId,
      distance: Infinity,
      processed: false,
      x: Math.random() * 800 + 50, // Random x position between 50 and 850
      y: Math.random() * 300 + 50, // Random y position between 50 and 350
    }
    setEditedVertices([...editedVertices, newNode])
  }

  const deleteNode = (id: number) => {
    if (id === startNode) {
      alert("Cannot delete the starting node. Please change the starting node first.")
      return
    }
    setEditedVertices(editedVertices.filter(v => v.id !== id))
    setEditedEdges(editedEdges.filter(e => e.from !== id && e.to !== id))
  }

  const handleSaveEdges = (newEdges: Edge[]) => {
    setEditedEdges(newEdges)
    setShowEdgePopup(false)
  }

  const handleStartNodeChange = (value: string) => {
    setStartNode(Number.parseInt(value, 10))
  }

  return (
    <div className="flex flex-col space-y-4">
      <Card className="w-full p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-center sm:justify-start">
              <span className="text-sm font-medium">Starting node:</span>
              <Select value={startNode.toString()} onValueChange={handleStartNodeChange}>
                <SelectTrigger className="w-[60px]">
                  <SelectValue>{startNode}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {editedVertices.map((vertex) => (
                    <SelectItem key={vertex.id} value={vertex.id.toString()}>
                      {vertex.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:flex sm:space-x-2 w-full sm:w-auto justify-center sm:justify-end">
              <Button onClick={() => setShowEdgePopup(true)} variant="outline">
                Edit Edges
              </Button>
              <Button onClick={addNode} variant="outline">
                Add Node
              </Button>
              <Button onClick={() => onSave(editedVertices, editedEdges, startNode)}>
                Done
                <Check className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
          <div className="w-full aspect-[2/1] lg:aspect-[3/1]">
            <svg
              ref={svgRef}
              viewBox="0 0 900 400"
              className="w-full h-full"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
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
              </defs>
              {/* Draw edges */}
              {editedEdges.map((edge) => {
                const from = editedVertices.find((v) => v.id === edge.from)!
                const to = editedVertices.find((v) => v.id === edge.to)!
                const { fromX, fromY, toX, toY } = calculateEdgePoints(from, to)

                // Calculate the midpoint
                const midX = (fromX + toX) / 2
                const midY = (fromY + toY) / 2

                // Determine if the edge is more vertical or horizontal
                const isVertical = Math.abs(toY - fromY) > Math.abs(toX - fromX)

                // Adjust text position
                const textX = isVertical ? midX + 15 : midX
                const textY = isVertical ? midY : midY - 15

                const edgeId = `${edge.from}-${edge.to}`

                return (
                  <g key={edgeId}>
                    <line
                      x1={fromX}
                      y1={fromY}
                      x2={toX}
                      y2={toY}
                      stroke="#666"
                      strokeWidth={2}
                      markerEnd="url(#arrowhead)"
                    />
                    {editingEdge === edgeId ? (
                      <foreignObject
                        x={textX - 20}
                        y={textY - 15}
                        width="40"
                        height="30"
                      >
                        <Input
                          type="text"
                          value={edge.tempWeight !== undefined ? edge.tempWeight : edge.weight}
                          onChange={(e) => handleEdgeValueChange(edgeId, e.target.value)}
                          onBlur={() => handleEdgeInputBlur(edgeId)}
                          onKeyPress={(e) => handleEdgeInputKeyPress(edgeId, e)}
                          className="w-full h-full text-center p-0"
                          style={{ fontSize: '12px', padding: '2px' }}
                          autoFocus
                        />
                      </foreignObject>
                    ) : (
                      <text
                        x={textX}
                        y={textY}
                        textAnchor="middle"
                        fill="#666"
                        dominantBaseline="middle"
                        onClick={() => handleEdgeClick(edgeId)}
                        style={{ cursor: 'pointer' }}
                      >
                        {edge.tempWeight !== undefined ? edge.tempWeight : edge.weight}
                      </text>
                    )}
                  </g>
                )
              })}

              {/* Draw vertices */}
              {editedVertices.map((vertex) => (
                <g
                  key={vertex.id}
                  transform={`translate(${vertex.x}, ${vertex.y})`}
                >
                  <rect
                    x={-halfNodeSize}
                    y={-halfNodeSize}
                    width={nodeSize}
                    height={nodeSize}
                    fill={vertex.id === startNode ? "#FFD700" : "#90EE90"}
                    stroke="#666"
                    strokeWidth={2}
                    onMouseDown={handleMouseDown(vertex.id)}
                    style={{ cursor: 'move' }}
                  />
                  <text
                    x={0}
                    y={5}
                    textAnchor="middle"
                    fill="#000"
                    pointerEvents="none"
                  >
                    {vertex.id}
                  </text>
                  {vertex.id !== startNode && (
                    <g
                      transform={`translate(${halfNodeSize}, ${-halfNodeSize})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNode(vertex.id);
                      }}
                      style={{ cursor: 'pointer' }}
                      role="button"
                      aria-label={`Delete node ${vertex.id}`}
                    >
                      <circle r="8" fill="red" />
                      <foreignObject x="-8" y="-8" width="16" height="16">
                        <div className="w-full h-full flex items-center justify-center">
                          <X
                            size={12}
                            color="white"
                            strokeWidth={3}
                          />
                        </div>
                      </foreignObject>
                    </g>
                  )}
                </g>
              ))}
            </svg>
          </div>
        </div>
      </Card>
      {showEdgePopup && (
        <EditEdgesPopup
          edges={editedEdges}
          vertices={editedVertices}
          onClose={() => setShowEdgePopup(false)}
          onSave={handleSaveEdges}
        />
      )}
    </div>
  )
}

