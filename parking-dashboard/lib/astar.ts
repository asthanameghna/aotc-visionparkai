// Pure TypeScript A* pathfinding implementation
// Works entirely on the frontend — no backend needed

export type Node = {
  id: string;
  x: number;
  y: number;
  type: "waypoint" | "slot" | "entrance";
};

export type Edge = {
  from: string;
  to: string;
  weight?: number;
};

export type Graph = {
  nodes: Record<string, Node>;
  edges: Edge[];
};

type AStarResult = {
  path: string[];
  cost: number;
} | null;

function heuristic(a: Node, b: Node): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function astar(graph: Graph, startId: string, goalId: string): AStarResult {
  const nodes = graph.nodes;
  if (!nodes[startId] || !nodes[goalId]) return null;

  // Build adjacency list
  const adj: Record<string, { id: string; weight: number }[]> = {};
  for (const edge of graph.edges) {
    const w = edge.weight ?? heuristic(nodes[edge.from], nodes[edge.to]);
    if (!adj[edge.from]) adj[edge.from] = [];
    if (!adj[edge.to]) adj[edge.to] = [];
    adj[edge.from].push({ id: edge.to, weight: w });
    adj[edge.to].push({ id: edge.from, weight: w }); // bidirectional
  }

  const openSet = new Set<string>([startId]);
  const cameFrom: Record<string, string> = {};
  const gScore: Record<string, number> = { [startId]: 0 };
  const fScore: Record<string, number> = {
    [startId]: heuristic(nodes[startId], nodes[goalId]),
  };

  while (openSet.size > 0) {
    // Pick node with lowest fScore
    let current = "";
    let lowestF = Infinity;
    for (const id of openSet) {
      const f = fScore[id] ?? Infinity;
      if (f < lowestF) { lowestF = f; current = id; }
    }

    if (current === goalId) {
      // Reconstruct path
      const path: string[] = [current];
      while (cameFrom[current]) {
        current = cameFrom[current];
        path.unshift(current);
      }
      return { path, cost: gScore[goalId] ?? 0 };
    }

    openSet.delete(current);

    for (const neighbor of adj[current] ?? []) {
      const tentativeG = (gScore[current] ?? Infinity) + neighbor.weight;
      if (tentativeG < (gScore[neighbor.id] ?? Infinity)) {
        cameFrom[neighbor.id] = current;
        gScore[neighbor.id] = tentativeG;
        fScore[neighbor.id] = tentativeG + heuristic(nodes[neighbor.id], nodes[goalId]);
        openSet.add(neighbor.id);
      }
    }
  }

  return null; // No path found
}

// ─── Demo parking lot graph ──────────────────────────────────────────────────
// A 4-row parking lot with 2 aisles and an entrance

export const DEMO_GRAPH: Graph = {
  nodes: {
    // Entrance
    entrance: { id: "entrance", x: 350, y: 470, type: "entrance" },

    // Aisle waypoints (horizontal lanes)
    w1: { id: "w1", x: 350, y: 380, type: "waypoint" },
    w2: { id: "w2", x: 350, y: 280, type: "waypoint" },
    w3: { id: "w3", x: 350, y: 180, type: "waypoint" },
    w4: { id: "w4", x: 350, y: 80, type: "waypoint" },

    // Branch waypoints left/right
    wL1: { id: "wL1", x: 180, y: 380, type: "waypoint" },
    wR1: { id: "wR1", x: 520, y: 380, type: "waypoint" },
    wL2: { id: "wL2", x: 180, y: 280, type: "waypoint" },
    wR2: { id: "wR2", x: 520, y: 280, type: "waypoint" },
    wL3: { id: "wL3", x: 180, y: 180, type: "waypoint" },
    wR3: { id: "wR3", x: 520, y: 180, type: "waypoint" },
    wL4: { id: "wL4", x: 180, y: 80, type: "waypoint" },
    wR4: { id: "wR4", x: 520, y: 80, type: "waypoint" },

    // Row A slots (left side, y=380)
    A1: { id: "A1", x: 80,  y: 380, type: "slot" },
    A2: { id: "A2", x: 130, y: 380, type: "slot" },
    A3: { id: "A3", x: 620, y: 380, type: "slot" },
    A4: { id: "A4", x: 670, y: 380, type: "slot" },

    // Row B slots (y=280)
    B1: { id: "B1", x: 80,  y: 280, type: "slot" },
    B2: { id: "B2", x: 130, y: 280, type: "slot" },
    B3: { id: "B3", x: 620, y: 280, type: "slot" },
    B4: { id: "B4", x: 670, y: 280, type: "slot" },

    // Row C slots (y=180)
    C1: { id: "C1", x: 80,  y: 180, type: "slot" },
    C2: { id: "C2", x: 130, y: 180, type: "slot" },
    C3: { id: "C3", x: 620, y: 180, type: "slot" },
    C4: { id: "C4", x: 670, y: 180, type: "slot" },

    // Row D slots (y=80)
    D1: { id: "D1", x: 80,  y: 80, type: "slot" },
    D2: { id: "D2", x: 130, y: 80, type: "slot" },
    D3: { id: "D3", x: 620, y: 80, type: "slot" },
    D4: { id: "D4", x: 670, y: 80, type: "slot" },
  },
  edges: [
    // Entrance → main aisle
    { from: "entrance", to: "w1" },
    { from: "w1", to: "w2" },
    { from: "w2", to: "w3" },
    { from: "w3", to: "w4" },

    // Horizontal branches
    { from: "w1", to: "wL1" }, { from: "w1", to: "wR1" },
    { from: "w2", to: "wL2" }, { from: "w2", to: "wR2" },
    { from: "w3", to: "wL3" }, { from: "w3", to: "wR3" },
    { from: "w4", to: "wL4" }, { from: "w4", to: "wR4" },

    // Slots connected to branch nodes
    { from: "wL1", to: "A1" }, { from: "wL1", to: "A2" },
    { from: "wR1", to: "A3" }, { from: "wR1", to: "A4" },
    { from: "wL2", to: "B1" }, { from: "wL2", to: "B2" },
    { from: "wR2", to: "B3" }, { from: "wR2", to: "B4" },
    { from: "wL3", to: "C1" }, { from: "wL3", to: "C2" },
    { from: "wR3", to: "C3" }, { from: "wR3", to: "C4" },
    { from: "wL4", to: "D1" }, { from: "wL4", to: "D2" },
    { from: "wR4", to: "D3" }, { from: "wR4", to: "D4" },
  ],
};

export const SLOT_IDS = ["A1","A2","A3","A4","B1","B2","B3","B4","C1","C2","C3","C4","D1","D2","D3","D4"];
