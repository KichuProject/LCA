import React from 'react';

interface SankeyNodeData {
  name: string;
}

interface SankeyLinkData {
  source: number;
  target: number;
  value: number;
}

interface SankeyData {
  nodes: SankeyNodeData[];
  links: SankeyLinkData[];
}

interface SimpleSankeyChartProps {
  data: SankeyData;
  width?: number;
  height?: number;
}

const SimpleSankeyChart: React.FC<SimpleSankeyChartProps> = ({ data, width = 700, height = 400 }) => {
  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg"
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-gray-600">No Sankey data available</div>
        </div>
      </div>
    );
  }

  // Define node positions based on the LCA flow structure
  const nodeWidth = 15;
  const nodeHeight = 60;
  const padding = 50;
  const availableWidth = width - 2 * padding;
  const availableHeight = height - 2 * padding;

  // Group nodes by stages
  const stages = [
    ['Raw Materials'],
    ['Virgin Material', 'Recycled Material'],
    ['Production'],
    ['Transport'],
    ['Use Phase'],
    ['End of Life'],
    ['Recycling', 'Landfill', 'Reuse']
  ];

  const nodePositions: { [key: string]: { x: number; y: number; width: number; height: number } } = {};
  
  stages.forEach((stageNodes, stageIndex) => {
    const x = padding + (stageIndex * availableWidth) / (stages.length - 1) - nodeWidth / 2;
    
    stageNodes.forEach((nodeName, nodeIndex) => {
      const nodeData = data.nodes.find(n => n.name === nodeName);
      if (nodeData) {
        const totalNodesInStage = stageNodes.length;
        const nodeSpacing = totalNodesInStage > 1 ? availableHeight / (totalNodesInStage + 1) : availableHeight / 2;
        const y = padding + (nodeIndex + 1) * nodeSpacing - nodeHeight / 2;
        
        nodePositions[nodeName] = { x, y, width: nodeWidth, height: nodeHeight };
      }
    });
  });

  // Create curved path for links
  const createCurvedPath = (
    x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number,
    thickness: number
  ) => {
    const startX = x1 + w1;
    const startY = y1 + h1 / 2;
    const endX = x2;
    const endY = y2 + h2 / 2;
    
    const midX = (startX + endX) / 2;
    
    const topPath = `M ${startX} ${startY - thickness/2} 
                     C ${midX} ${startY - thickness/2} ${midX} ${endY - thickness/2} ${endX} ${endY - thickness/2}`;
    const bottomPath = `L ${endX} ${endY + thickness/2} 
                        C ${midX} ${endY + thickness/2} ${midX} ${startY + thickness/2} ${startX} ${startY + thickness/2} Z`;
    
    return topPath + bottomPath;
  };

  // Color scheme for different materials/stages
  const getNodeColor = (nodeName: string) => {
    const colorMap: { [key: string]: string } = {
      'Raw Materials': '#64748b',
      'Virgin Material': '#f97316',
      'Recycled Material': '#22c55e',
      'Production': '#3b82f6',
      'Transport': '#8b5cf6',
      'Use Phase': '#06b6d4',
      'End of Life': '#84cc16',
      'Recycling': '#22c55e',
      'Landfill': '#ef4444',
      'Reuse': '#f59e0b'
    };
    return colorMap[nodeName] || '#64748b';
  };

  const getLinkColor = (sourceIndex: number, targetIndex: number) => {
    const sourceNode = data.nodes[sourceIndex];
    return getNodeColor(sourceNode.name);
  };

  return (
    <div className="border rounded-lg bg-white p-4">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Define gradients for links */}
        <defs>
          {data.links.map((link, index) => (
            <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={getLinkColor(link.source, link.target)} stopOpacity="0.6" />
              <stop offset="100%" stopColor={getLinkColor(link.source, link.target)} stopOpacity="0.3" />
            </linearGradient>
          ))}
        </defs>

        {/* Draw curved links */}
        {data.links.map((link, index) => {
          const sourceNode = data.nodes[link.source];
          const targetNode = data.nodes[link.target];
          
          if (!sourceNode || !targetNode) return null;
          
          const sourcePos = nodePositions[sourceNode.name];
          const targetPos = nodePositions[targetNode.name];
          
          if (!sourcePos || !targetPos) return null;
          
          const thickness = Math.max(2, Math.min(40, link.value / 3));
          
          return (
            <path
              key={`link-${index}`}
              d={createCurvedPath(
                sourcePos.x, sourcePos.y, sourcePos.width, sourcePos.height,
                targetPos.x, targetPos.y, targetPos.width, targetPos.height,
                thickness
              )}
              fill={`url(#gradient-${index})`}
              stroke="none"
              opacity={0.7}
            />
          );
        })}
        
        {/* Draw nodes */}
        {Object.entries(nodePositions).map(([nodeName, pos]) => (
          <g key={`node-${nodeName}`}>
            <rect
              x={pos.x}
              y={pos.y}
              width={pos.width}
              height={pos.height}
              fill={getNodeColor(nodeName)}
              rx={2}
              ry={2}
              stroke="#fff"
              strokeWidth={1}
            />
            <text
              x={pos.x + pos.width + 8}
              y={pos.y + pos.height / 2}
              dominantBaseline="middle"
              fill="#374151"
              fontSize="12"
              fontWeight="500"
            >
              {nodeName}
            </text>
          </g>
        ))}
      </svg>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-gray-600">
        <div>
          <h4 className="font-semibold mb-2">Material Types</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f97316' }}></div>
              <span>Virgin Material</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#22c55e' }}></div>
              <span>Recycled Material</span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">End of Life</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#22c55e' }}></div>
              <span>Recycling</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></div>
              <span>Landfill</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
              <span>Reuse</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleSankeyChart;