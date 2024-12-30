import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from 'lucide-react'
import { Edge } from './types'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Vertex {
  id: number;
}

interface EditEdgesPopupProps {
  edges: Edge[]
  vertices: Vertex[]
  onClose: () => void
  onSave: (newEdges: Edge[]) => void
}

export function EditEdgesPopup({ edges, vertices, onClose, onSave }: EditEdgesPopupProps) {
  const [editedEdges, setEditedEdges] = useState<Edge[]>(edges)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleAddEdge = () => {
    if (vertices.length < 2) {
      setErrorMessage("Need at least two vertices to add an edge.");
      return;
    }
    setEditedEdges([...editedEdges, { from: vertices[0].id, to: vertices[1].id, weight: 1, active: false }]);
  }

  const handleDeleteEdge = (index: number) => {
    setEditedEdges(editedEdges.filter((_, i) => i !== index))
  }

  const handleEdgeChange = (index: number, field: keyof Edge, value: number) => {
    if (field === 'weight' && value < 0) {
      setErrorMessage("Edge values cannot be negative.");
      return;
    }
    setErrorMessage(null);
    setEditedEdges(
      editedEdges.map((edge, i) =>
        i === index ? { ...edge, [field]: value } : edge
      )
    )
  }

  const handleSave = () => {
    const edgeSet = new Set<string>()
    for (const edge of editedEdges) {
      if (edge.from === edge.to) {
        setErrorMessage(`Self-loops are not allowed: ${edge.from} to ${edge.to}`)
        return
      }
      if (edge.weight < 0) {
        setErrorMessage(`Negative edge weights are not allowed: ${edge.from} to ${edge.to}`)
        return
      }
      const edgeKey = `${edge.from}-${edge.to}`
      if (edgeSet.has(edgeKey)) {
        setErrorMessage(`Duplicate edge detected: ${edge.from} to ${edge.to}`)
        return
      }
      edgeSet.add(edgeKey)
    }
    setErrorMessage(null)
    onSave(editedEdges)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-auto min-w-[600px] max-w-[95%] max-h-[90vh] overflow-y-auto relative">
        <div className="flex justify-center items-center mb-4">
          <h2 className="text-2xl font-bold">Edit Edges</h2>
          <Button variant="ghost" onClick={onClose} className="absolute right-2 top-2">
            <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center space-x-2 font-bold">
            <div className="w-16">From</div>
            <div className="w-16">To</div>
            <div className="w-16">Weight</div>
            <div className="w-8"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {editedEdges.map((edge, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Select
                value={edge.from.toString()}
                onValueChange={(value) => handleEdgeChange(index, 'from', parseInt(value))}
              >
                <SelectTrigger className="w-16">
                  <SelectValue>{edge.from}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {vertices.map((vertex) => (
                    <SelectItem key={vertex.id} value={vertex.id.toString()}>
                      {vertex.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={edge.to.toString()}
                onValueChange={(value) => handleEdgeChange(index, 'to', parseInt(value))}
              >
                <SelectTrigger className="w-16">
                  <SelectValue>{edge.to}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {vertices.map((vertex) => (
                    <SelectItem key={vertex.id} value={vertex.id.toString()}>
                      {vertex.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="0"
                value={edge.weight}
                onChange={(e) => handleEdgeChange(index, 'weight', parseInt(e.target.value))}
                className="w-16"
                placeholder="Weight"
              />
              <Button variant="destructive" onClick={() => handleDeleteEdge(index)} className="px-2 h-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center space-x-2">
          {errorMessage && (
            <Alert variant="destructive" className="mt-4 mb-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <Button onClick={handleAddEdge} variant="outline">Add Edge</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  )
}

