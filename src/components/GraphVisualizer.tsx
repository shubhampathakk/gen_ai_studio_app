import React, { useCallback, useEffect, useState } from 'react';
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  MarkerType,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { GraphData } from '../types';

interface GraphVisualizerProps {
  data: GraphData;
  onNodeClick: (nodeId: string) => void;
}

const nodeTypes = {
  // We can define custom node types here if needed
};

export function GraphVisualizer({ data, onNodeClick }: GraphVisualizerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    // Transform data to React Flow format
    // Simple auto-layout simulation (in a real app, use dagre or elkjs)
    const layoutNodes = data.nodes.map((node, index) => ({
      id: node.id,
      type: 'default',
      data: { label: `${node.technical_name}\n(${node.type})` },
      position: { x: (index % 3) * 250, y: Math.floor(index / 3) * 150 },
      style: { 
        background: getNodeColor(node.type),
        color: '#fff',
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
        width: 180,
        textAlign: 'center'
      },
    }));

    const layoutEdges = data.edges.map((edge) => ({
      id: edge.id,
      source: edge.source_id,
      target: edge.target_id,
      label: edge.type,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed },
      animated: true,
      style: { stroke: '#64748b' }
    }));

    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [data, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="h-full w-full bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => onNodeClick(node.id)}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

function getNodeColor(type: string) {
  switch (type) {
    case 'CUBE': return '#3b82f6'; // Blue
    case 'ADSO': return '#10b981'; // Emerald
    case 'DATASOURCE': return '#f59e0b'; // Amber
    case 'HCPR': return '#8b5cf6'; // Violet
    default: return '#64748b'; // Slate
  }
}
