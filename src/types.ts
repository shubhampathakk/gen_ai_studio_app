export interface Node {
  id: string;
  technical_name: string;
  type: string;
  description: string;
  deployment_status: 'PENDING' | 'DEPLOYED';
}

export interface Edge {
  id: string;
  source_id: string;
  target_id: string;
  type: string;
}

export interface AbapRoutine {
  id: string;
  node_id: string;
  routine_type: string;
  abap_code: string;
  converted_sql?: string;
  status: 'PENDING' | 'CONVERTED' | 'VERIFIED';
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}
