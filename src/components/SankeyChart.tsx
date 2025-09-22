import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface SankeyChartProps {
  material?: string;
  quantity?: number;
  processRoute?: string;
  width?: number;
  height?: number;
}

const SankeyChart: React.FC<SankeyChartProps> = ({ 
  material = "Aluminium", 
  quantity = 25, 
  processRoute = "hybrid",
  width = 900, 
  height = 400 
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous chart
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Simplified approach - draw manually without d3-sankey for now
    const margin = { top: 40, right: 40, bottom: 80, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define nodes positions manually to match the image exactly
    const nodeData = [
      { name: "Raw Materials", x: 20, y: innerHeight/2 - 40, width: 80, height: 80, color: "#64748b" },
      { name: "Virgin Material", x: 180, y: innerHeight/2 - 80, width: 100, height: 30, color: "#f97316" },
      { name: "Recycled Material", x: 180, y: innerHeight/2 + 50, width: 100, height: 30, color: "#22c55e" },
      { name: "Production", x: 350, y: innerHeight/2 - 15, width: 80, height: 30, color: "#3b82f6" },
      { name: "Transport", x: 480, y: innerHeight/2 - 15, width: 80, height: 30, color: "#8b5cf6" },
      { name: "Use Phase", x: 610, y: innerHeight/2 - 15, width: 80, height: 30, color: "#06b6d4" },
      { name: "End of Life", x: 740, y: innerHeight/2 - 15, width: 80, height: 30, color: "#84cc16" },
      { name: "Recycl", x: 880, y: innerHeight/2 - 80, width: 60, height: 30, color: "#22c55e" },
      { name: "Landfi", x: 880, y: innerHeight/2 - 15, width: 60, height: 30, color: "#ef4444" },
      { name: "Reuse", x: 880, y: innerHeight/2 + 50, width: 60, height: 30, color: "#f59e0b" }
    ];

    // Draw curved paths manually
    const linkData = [
      // From Raw Materials
      { source: nodeData[0], target: nodeData[1], strokeWidth: 20, color: "#f97316" },
      { source: nodeData[0], target: nodeData[2], strokeWidth: 12, color: "#22c55e" },
      
      // To Production
      { source: nodeData[1], target: nodeData[3], strokeWidth: 20, color: "#f97316" },
      { source: nodeData[2], target: nodeData[3], strokeWidth: 12, color: "#22c55e" },
      
      // Through process stages
      { source: nodeData[3], target: nodeData[4], strokeWidth: 32, color: "#3b82f6" },
      { source: nodeData[4], target: nodeData[5], strokeWidth: 32, color: "#8b5cf6" },
      { source: nodeData[5], target: nodeData[6], strokeWidth: 32, color: "#06b6d4" },
      
      // To end destinations
      { source: nodeData[6], target: nodeData[7], strokeWidth: 20, color: "#22c55e" },
      { source: nodeData[6], target: nodeData[8], strokeWidth: 6, color: "#ef4444" },
      { source: nodeData[6], target: nodeData[9], strokeWidth: 6, color: "#f59e0b" },
      
      // Circular flows back to raw materials (curved paths)
      { source: nodeData[7], target: nodeData[0], strokeWidth: 16, color: "#22c55e", curved: true },
      { source: nodeData[9], target: nodeData[0], strokeWidth: 5, color: "#f59e0b", curved: true }
    ];

    // Create path generator for curved links
    const createPath = (link: any) => {
      const sx = link.source.x + link.source.width;
      const sy = link.source.y + link.source.height / 2;
      const tx = link.target.x;
      const ty = link.target.y + link.target.height / 2;
      
      if (link.curved) {
        // For circular flows, create a curved path that goes up/down and back
        const midX = (sx + tx) / 2;
        const curveHeight = sy < ty ? -120 : 120; // Curve up for recycle, down for reuse
        const controlY = Math.min(sy, ty) + curveHeight;
        
        return `M${sx},${sy}Q${midX},${controlY} ${tx},${ty}`;
      } else {
        // For forward flows, create smooth bezier curves
        const dx = tx - sx;
        const cx1 = sx + dx * 0.5;
        const cy1 = sy;
        const cx2 = sx + dx * 0.5;
        const cy2 = ty;
        
        return `M${sx},${sy}C${cx1},${cy1} ${cx2},${cy2} ${tx},${ty}`;
      }
    };

    // Draw links first (behind nodes)
    g.selectAll('.link')
      .data(linkData)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', createPath)
      .attr('stroke', d => d.color)
      .attr('stroke-width', d => d.strokeWidth)
      .attr('fill', 'none')
      .attr('opacity', 0.7)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.9)
          .attr('stroke-width', d.strokeWidth + 2);
        
        // Show tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'sankey-tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0,0,0,0.9)')
          .style('color', 'white')
          .style('padding', '8px 12px')
          .style('border-radius', '6px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', '1000')
          .style('opacity', 0);
        
        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`
          <div><strong>${d.source.name} → ${d.target.name}</strong></div>
          <div>Flow: ${(d.strokeWidth * 0.8).toFixed(1)} kg</div>
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.7)
          .attr('stroke-width', d.strokeWidth);
        
        d3.selectAll('.sankey-tooltip').remove();
      });

    // Draw nodes
    g.selectAll('.node')
      .data(nodeData)
      .enter()
      .append('rect')
      .attr('class', 'node')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-width', 3)
          .style('filter', 'brightness(1.1)');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-width', 2)
          .style('filter', 'brightness(1)');
      });

    // Add node labels
    g.selectAll('.label')
      .data(nodeData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => {
        // Position labels based on node position
        if (d.x < innerWidth * 0.2) return d.x + d.width + 8;     // Left side - label right
        if (d.x > innerWidth * 0.8) return d.x - 8;              // Right side - label left
        return d.x + d.width / 2;                                 // Center - label center
      })
      .attr('y', d => d.y + d.height / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => {
        if (d.x < innerWidth * 0.2) return 'start';
        if (d.x > innerWidth * 0.8) return 'end';
        return 'middle';
      })
      .style('font-family', 'Arial, sans-serif')
      .style('font-size', '11px')
      .style('font-weight', '500')
      .style('fill', '#374151')
      .text(d => d.name);

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', '#1f2937')
      .text(`LCA Material Flow: ${material} (${quantity} kg)`);

  }, [material, quantity, processRoute, width, height]);

  return (
    <div className="sankey-container w-full">
      <svg 
        ref={svgRef} 
        width={width} 
        height={height} 
        className="w-full h-auto border border-gray-200 rounded-lg shadow-sm bg-white"
        style={{ minHeight: '400px' }}
      >
        <text x={width/2} y={height/2} textAnchor="middle" fill="#6b7280" className="text-sm">
          Loading Sankey Diagram...
        </text>
      </svg>
      
      {/* Legend matching the image */}
      <div className="mt-4 flex flex-wrap gap-6 text-sm">
        {/* Material Types */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Material Types</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-orange-500"></div>
              <span className="text-gray-600">Virgin Material</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-green-500"></div>
              <span className="text-gray-600">Recycled Material</span>
            </div>
          </div>
        </div>
        
        {/* End of Life */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">End of Life</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-green-500"></div>
              <span className="text-gray-600">Recycling</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-red-500"></div>
              <span className="text-gray-600">Landfill</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-yellow-500"></div>
              <span className="text-gray-600">Reuse</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SankeyChart;
